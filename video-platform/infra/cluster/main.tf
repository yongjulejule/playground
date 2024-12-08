provider "null" {}

# SSH 키 생성
resource "tls_private_key" "ssh_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

# SSH 키를 로컬에 저장
resource "local_file" "ssh_private_key" {
  content         = tls_private_key.ssh_key.private_key_pem
  filename        = "${path.module}/id_rsa"
  file_permission = "0600"
}

resource "local_file" "ssh_public_key" {
  content  = tls_private_key.ssh_key.public_key_openssh
  filename = "${path.module}/id_rsa.pub"
}

# Cloud-init 설정 파일 생성
resource "local_file" "cloud_init_config" {
  content  = <<EOT
#cloud-config
users:
  - name: ubuntu
    ssh-authorized-keys:
      - ${local_file.ssh_public_key.content}
EOT
  filename = "${path.module}/cloud-init.yaml"
}

# 마스터 노드 생성
resource "null_resource" "create_master_vm" {
  provisioner "local-exec" {
    command = "multipass launch --name kube-master --cpus 2 --memory 4096MIB --disk 20G --cloud-init=${local_file.cloud_init_config.filename} 22.04"
  }

  provisioner "local-exec" {
    when    = destroy
    command = "multipass delete kube-master && multipass purge"
  }
}

# 워커 노드 생성
resource "null_resource" "create_worker_vm" {
  provisioner "local-exec" {
    command = "multipass launch --name kube-worker1 --cpus 2 --memory 4096MiB --disk 20G --cloud-init=${local_file.cloud_init_config.filename} 22.04"
  }

  provisioner "local-exec" {
    when    = destroy
    command = "multipass delete kube-worker1 && multipass purge"
  }
}

# 마스터 노드 IP 가져오기
data "external" "master_ip" {
  depends_on = [null_resource.create_master_vm]

  program = ["bash", "-c", <<EOT
    IP=$(multipass info kube-master | grep IPv4 | awk '{print $2}')
    echo "{\"output\": \"$IP\"}"
EOT
  ]
}

# 워커 노드 IP 가져오기
data "external" "worker_ip" {
  depends_on = [null_resource.create_worker_vm]

  program = ["bash", "-c", <<EOT
    IP=$(multipass info kube-worker1 | grep IPv4 | awk '{print $2}')
    echo "{\"output\": \"$IP\"}"
EOT
  ]
}

# Kubeadm 설치 및 초기화 (마스터 노드)
resource "null_resource" "setup_master" {
  depends_on = [data.external.master_ip]

  connection {
    type        = "ssh"
    user        = "ubuntu"
    private_key = file(local_file.ssh_private_key.filename)
    host        = data.external.master_ip.result["output"]
  }

  provisioner "remote-exec" {
    inline = [
      # 시스템 설정
      "sudo swapoff -a",
      "sudo sed -i '/ swap / s/^/#/' /etc/fstab",

      # 커널 모듈 설정
      "sudo modprobe overlay",
      "sudo modprobe br_netfilter",

      # 시스템 파라미터 설정
      "cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf",
      "net.bridge.bridge-nf-call-iptables  = 1",
      "net.bridge.bridge-nf-call-ip6tables = 1",
      "net.ipv4.ip_forward                 = 1",
      "EOF",
      "sudo sysctl --system",

      # containerd 설치 및 설정
      "sudo apt-get update",
      "sudo apt-get install -y apt-transport-https ca-certificates curl",
      "sudo apt-get install -y containerd",
      "sudo mkdir -p /etc/containerd",
      "containerd config default | sudo tee /etc/containerd/config.toml",
      "sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml",
      "sudo systemctl restart containerd",
      "sudo systemctl enable containerd",

      # Kubernetes 패키지 설치
      "sudo mkdir -p /etc/apt/keyrings",
      "curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.31/deb/Release.key | sudo gpg --yes --dearmor -o /etc/apt/keyrings/kubernetes-archive-keyring.gpg",
      "echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-archive-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.31/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list",
      "sudo apt-get update",
      "sudo apt-get install -y kubelet kubeadm kubectl",
      "sudo apt-mark hold kubelet kubeadm kubectl",

      # kubelet 설정
      "cat <<EOF | sudo tee /etc/default/kubelet",
      "KUBELET_EXTRA_ARGS=--node-ip=$(hostname -I | awk '{print $1}')",
      "EOF",
      "sudo systemctl daemon-reload",
      "sudo systemctl restart kubelet",

      # kubeadm 초기화
      "sudo kubeadm init --pod-network-cidr=192.168.0.0/16 --apiserver-advertise-address=$(hostname -I | awk '{print $1}')",

      # kubeconfig 설정
      "mkdir -p $HOME/.kube",
      "sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config",
      "sudo chown $(id -u):$(id -g) $HOME/.kube/config"
    ]
  }
}

# 마스터 노드의 kubeconfig 가져오기
data "external" "kubeconfig" {
  depends_on = [null_resource.setup_master]

  program = ["bash", "-c", <<EOT
    OUTPUT=$(ssh -o StrictHostKeyChecking=accept-new -i ${local_file.ssh_private_key.filename} ubuntu@${data.external.master_ip.result["output"]} "sudo cat /etc/kubernetes/admin.conf" | base64 -w0)
    echo "{\"output\": \"$OUTPUT\"}"
EOT
  ]
}

# kubeconfig 파일 저장
resource "local_file" "kubeconfig" {
  content  = base64decode(data.external.kubeconfig.result["output"])
  filename = "${path.module}/kubeconfig"
}

provider "kubernetes" {
  config_path = local_file.kubeconfig.filename
}

provider "helm" {
  kubernetes {
    config_path = local_file.kubeconfig.filename
  }
}

# Calico 네트워크 플러그인 설치
resource "helm_release" "calico" {
  depends_on = [local_file.kubeconfig]

  name       = "calico"
  chart      = "tigera-operator"
  repository = "https://docs.projectcalico.org/charts"
  namespace  = "kube-system"

  set {
    name  = "global.calicoNetwork.ipPools[0].cidr"
    value = "192.168.0.0/16"
  }
}

# Join 커맨드 생성
resource "null_resource" "create_join_command" {
  depends_on = [null_resource.setup_master, helm_release.calico]

  connection {
    type        = "ssh"
    user        = "ubuntu"
    private_key = file(local_file.ssh_private_key.filename)
    host        = data.external.master_ip.result["output"]
  }

  provisioner "remote-exec" {
    inline = [
      "sudo kubeadm token create --print-join-command > /tmp/join-command.sh",
      "cat /tmp/join-command.sh"
    ]
  }
}

# Join 커맨드 가져오기
data "external" "join_command" {
  depends_on = [null_resource.create_join_command]

  program = ["bash", "-c", <<EOT
    JOIN_CMD=$(ssh -o StrictHostKeyChecking=accept-new -i ${local_file.ssh_private_key.filename} ubuntu@${data.external.master_ip.result["output"]} "cat /tmp/join-command.sh")
    echo "{\"output\": \"$JOIN_CMD\"}"
EOT
  ]
}

# 워커 노드 설정 및 조인
resource "null_resource" "setup_worker" {
  depends_on = [null_resource.create_join_command]

  connection {
    type        = "ssh"
    user        = "ubuntu"
    private_key = file(local_file.ssh_private_key.filename)
    host        = data.external.worker_ip.result["output"]
  }

  provisioner "remote-exec" {
    inline = [
      # 시스템 설정
      "sudo swapoff -a",
      "sudo sed -i '/ swap / s/^/#/' /etc/fstab",

      # 커널 모듈 설정
      "sudo modprobe overlay",
      "sudo modprobe br_netfilter",

      # 시스템 파라미터 설정
      "cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf",
      "net.bridge.bridge-nf-call-iptables  = 1",
      "net.bridge.bridge-nf-call-ip6tables = 1",
      "net.ipv4.ip_forward                 = 1",
      "EOF",
      "sudo sysctl --system",

      # containerd 설치 및 설정
      "sudo apt-get update",
      "sudo apt-get install -y apt-transport-https ca-certificates curl",
      "sudo apt-get install -y containerd",
      "sudo mkdir -p /etc/containerd",
      "containerd config default | sudo tee /etc/containerd/config.toml",
      "sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml",
      "sudo systemctl restart containerd",
      "sudo systemctl enable containerd",

      # Kubernetes 패키지 설치
      "sudo mkdir -p /etc/apt/keyrings",
      "curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.31/deb/Release.key | sudo gpg --yes --dearmor -o /etc/apt/keyrings/kubernetes-archive-keyring.gpg",
      "echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-archive-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.31/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list",
      "sudo apt-get update",
      "sudo apt-get install -y kubelet kubeadm kubectl",
      "sudo apt-mark hold kubelet kubeadm kubectl",

      # kubelet 설정
      "cat <<EOF | sudo tee /etc/default/kubelet",
      "KUBELET_EXTRA_ARGS=--node-ip=$(hostname -I | awk '{print $1}')",
      "EOF",
      "sudo systemctl daemon-reload",
      "sudo systemctl restart kubelet",

      # 클러스터 조인
      "sudo ${data.external.join_command.result["output"]}"
    ]
  }
}

output "master_ip" {
  value = data.external.master_ip.result["output"]
}

output "worker_ip" {
  value = data.external.worker_ip.result["output"]
}
