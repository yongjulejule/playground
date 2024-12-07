provider "null" {}

# Cloud-init 설정 파일 생성
resource "local_file" "cloud_init_config" {
  content  = <<EOT
#cloud-config
users:
  - name: ubuntu
    ssh-authorized-keys:
      - ${file("~/.ssh/id_rsa.pub")}
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

# Multipass 워커 노드의 IP 가져오기
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
    private_key = file("~/.ssh/id_rsa")
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

resource "null_resource" "create_join_command" {
  depends_on = [null_resource.setup_master]

  connection {
    type        = "ssh"
    user        = "ubuntu"
    private_key = file("~/.ssh/id_rsa")
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
    JOIN_CMD=$(ssh -i ~/.ssh/id_rsa ubuntu@${data.external.master_ip.result["output"]} "cat /tmp/join-command.sh")
    echo "{\"output\": \"$JOIN_CMD\"}"
  EOT
  ]
}


output "join_command" {
  value = data.external.join_command.result["output"]
}


# 워커 노드 설정 및 클러스터 조인
resource "null_resource" "setup_worker" {
  depends_on = [null_resource.create_join_command]

  connection {
    type        = "ssh"
    user        = "ubuntu"
    private_key = file("~/.ssh/id_rsa")
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

output "master_ip" {
  value = data.external.master_ip.result["output"]
}

output "worker_ip" {
  value = data.external.worker_ip.result["output"]
}
