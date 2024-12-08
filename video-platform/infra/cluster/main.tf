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
  file_permission = "0600" # 보안 설정
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
    command = "multipass launch --name kube-worker1 --cpus 2 --memory 4096MIB --disk 20G --cloud-init=${local_file.cloud_init_config.filename} 22.04"
  }

  provisioner "local-exec" {
    when    = destroy
    command = "multipass delete kube-worker1 && multipass purge"
  }
}

# 마스터 노드 IP 가져오기
# Multipass 마스터 노드의 IP 가져오기
data "external" "master_ip" {
  depends_on = [null_resource.create_master_vm]

  program = ["bash", "-c", <<EOT
    IP=$(multipass info kube-master | grep IPv4 | awk '{print $2}')
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
      # 필수 패키지 설치
      "sudo apt-get update -y",
      "sudo apt-get install -y apt-transport-https ca-certificates curl",

      # containerd 설치
      "sudo apt-get install -y containerd",
      "sudo mkdir -p /etc/containerd",
      "containerd config default | sudo tee /etc/containerd/config.toml",
      "sudo systemctl restart containerd",
      "sudo systemctl enable containerd",

      # Kubernetes 키 파일 설정
      "sudo mkdir -p /etc/apt/keyrings",
      "curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.31/deb/Release.key | sudo gpg --yes --dearmor -o /etc/apt/keyrings/kubernetes-archive-keyring.gpg",

      # Kubernetes 저장소 추가
      "echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-archive-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.31/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list",

      # 패키지 목록 업데이트
      "sudo apt-get update -y",

      # Kubernetes 패키지 설치
      "sudo apt-get install -y kubelet kubeadm kubectl",

      # ip_forward 설정
      "echo '1' | sudo tee /proc/sys/net/ipv4/ip_forward",
      "sudo sysctl -w net.ipv4.ip_forward=1",

      # Kubernetes 초기화 (예제 네트워크 CIDR 사용)
      "sudo kubeadm init --pod-network-cidr=192.168.0.0/16"
    ]
  }
}


output "master_ip" {
  value = data.external.master_ip.result["output"]
}

output "worker_ip" {
  value = data.external.worker_ip.result["output"]
}

# 마스터 노드의 kubeconfig 파일을 가져오기
data "external" "kubeconfig" {
  depends_on = [null_resource.setup_master]

  # NOTE: Using 'sudo' is not recommended for production. 
  program = ["bash", "-c", <<EOT
    OUTPUT=$(ssh -o StrictHostKeyChecking=accept-new -i ${local_file.ssh_private_key.filename} ubuntu@${data.external.master_ip.result["output"]} "sudo cat /etc/kubernetes/admin.conf" | base64 -w0)
    echo "{\"output\": \"$OUTPUT\"}"
  EOT
  ]
}

# kubeconfig 파일을 로컬에 저장
resource "local_file" "kubeconfig" {
  content  = base64decode(data.external.kubeconfig.result["output"])
  filename = "${path.module}/kubeconfig"
}

# Kubernetes Provider를 해당 kubeconfig로 설정
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
  name       = "calico"                                # Helm Release 이름
  chart      = "tigera-operator"                       # Calico 설치를 위한 기본 차트
  repository = "https://docs.projectcalico.org/charts" # Helm Chart 저장소 URL
  namespace  = "kube-system"                           # Calico는 kube-system 네임스페이스에 설치

  # Helm Chart 설정 값
  set {
    name  = "global.calicoNetwork.ipPools[0].cidr"
    value = "192.168.0.0/16" # Pod 네트워크 CIDR (kubeadm init 값과 일치)
  }

  # Calico 설치 시 필요한 옵션 추가 가능
  set {
    name  = "global.felix.logSeverityScreen"
    value = "info" # 로그 수준 (필요 시 조정)
  }

  # Calico BGP 활성화/비활성화
  set {
    name  = "global.bgp"
    value = "Disabled" # BGP 비활성화 (기본값: Enabled)
  }

  # 노드 간 VXLAN 네트워크 사용
  set {
    name  = "global.calicoNetwork.nodeAddressAutodetectionMethod"
    value = "can-reach=192.168.64.1" # 클러스터의 기본 게이트웨이와 연결 가능 여부 설정
  }
}

output "calico_status" {
  value = helm_release.calico.status
}

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
      # Join Command 생성 및 출력
      "sudo kubeadm token create --print-join-command > /tmp/join-command.sh",
      "cat /tmp/join-command.sh"
    ]
  }
}

data "external" "join_command" {
  depends_on = [null_resource.create_join_command]

  program = ["bash", "-c", <<EOT
    JOIN_CMD=$(ssh -o StrictHostKeyChecking=accept-new -i ${local_file.ssh_private_key.filename} ubuntu@${data.external.master_ip.result["output"]} "cat /tmp/join-command.sh")
    echo "{\"output\": \"$JOIN_CMD\"}"
  EOT
  ]
}


output "join_command" {
  value = data.external.join_command.result["output"]
}

# 워커 노드 설정 및 클러스터 조인
resource "null_resource" "setup_worker" {
  depends_on = [null_resource.create_join_command, ]

  connection {
    type        = "ssh"
    user        = "ubuntu"
    private_key = file(local_file.ssh_private_key.filename)
    host        = data.external.worker_ip.result["output"]
  }

  provisioner "remote-exec" {
    inline = [
      # 필수 패키지 설치
      "sudo apt-get update -y",
      "sudo apt-get install -y apt-transport-https ca-certificates curl",

      # containerd 설치
      "sudo apt-get install -y containerd",
      "sudo mkdir -p /etc/containerd",
      "containerd config default | sudo tee /etc/containerd/config.toml",
      "sudo systemctl restart containerd",
      "sudo systemctl enable containerd",

      # Kubernetes 키 파일 설정
      "sudo mkdir -p /etc/apt/keyrings",
      "curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.31/deb/Release.key | sudo gpg --yes --dearmor -o /etc/apt/keyrings/kubernetes-archive-keyring.gpg",

      # Kubernetes 저장소 추가
      "echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-archive-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.31/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list",

      # 패키지 목록 업데이트
      "sudo apt-get update -y",

      # Kubernetes 패키지 설치
      "sudo apt-get install -y kubelet kubeadm kubectl",

      # ip_forward 설정
      "echo '1' | sudo tee /proc/sys/net/ipv4/ip_forward",
      "sudo sysctl -w net.ipv4.ip_forward=1",

      # Join Command 실행
      "sudo ${data.external.join_command.result["output"]}"
    ]
  }
}

# Multipass 워커 노드의 IP 가져오기
data "external" "worker_ip" {
  depends_on = [null_resource.create_worker_vm]

  program = ["bash", "-c", <<EOT
    IP=$(multipass info kube-worker1 | grep IPv4 | awk '{print $2}')
    echo "{\"output\": \"$IP\"}"
EOT
  ]
}
