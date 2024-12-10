provider "null" {}

# Lima 설정 파일 복사
# Lima 마스터 노드 설정
resource "local_file" "master_config" {
  content  = <<EOT
arch: "aarch64"
images:
- location: "https://cloud-images.ubuntu.com/releases/22.04/release/ubuntu-22.04-server-cloudimg-arm64.img"
  arch: "aarch64"

cpus: 4
memory: 8GiB
disk: 40GiB

networks:
  - lima: shared
    macAddress: "02:00:00:00:00:01"


portForwards:
  - guestIP: "0.0.0.0"
    guestPort: 6443
    hostIP: "127.0.0.1"
    hostPort: 6443

containerd:
  system: true
  user: true
EOT
  filename = "${path.module}/generated/master.yaml"
}

# Lima 워커 노드 설정
resource "local_file" "worker_config" {
  content  = <<EOT
arch: "aarch64"
images:
- location: "https://cloud-images.ubuntu.com/releases/22.04/release/ubuntu-22.04-server-cloudimg-arm64.img"
  arch: "aarch64"

cpus: 2
memory: 4GiB
disk: 20GiB

networks:
- lima: shared
  macAddress: "02:00:00:00:00:02" # Master 노드


containerd:
  system: true
  user: true
EOT
  filename = "${path.module}/generated/worker.yaml"
}

# Master 노드 생성
resource "null_resource" "create_master" {
  depends_on = [local_file.master_config]

  provisioner "local-exec" {
    command = "limactl start --name=k8s-master ${path.module}/generated/master.yaml"
  }

  provisioner "local-exec" {
    when    = destroy
    command = "limactl stop k8s-master && limactl delete k8s-master"
  }
}

# Worker 노드 생성
resource "null_resource" "create_worker" {
  depends_on = [local_file.worker_config, null_resource.create_master]

  provisioner "local-exec" {
    command = "limactl start --name=k8s-worker ${path.module}/generated/worker.yaml"
  }

  provisioner "local-exec" {
    when    = destroy
    command = "limactl stop k8s-worker && limactl delete k8s-worker"
  }
}

# Master 노드 IP 가져오기
data "external" "master_ip" {
  depends_on = [null_resource.create_master]

  program = ["bash", "-c", <<EOT
limactl shell k8s-master ip addr show lima0 | grep "inet " | awk '{print $2}' | cut -d'/' -f1 | jq -R -c '{ "output": . }'
EOT
  ]
}

# Master 노드 설정
resource "null_resource" "setup_master" {
  depends_on = [data.external.master_ip]

  # 스크립트를 VM으로 복사
  provisioner "local-exec" {
    command = "limactl copy ${path.module}/scripts/setup-master.sh k8s-master:/tmp/setup-master.sh"
  }

  # 스크립트에 실행 권한 부여하고 실행
  provisioner "local-exec" {
    command = "limactl shell k8s-master sudo bash -c 'chmod +x /tmp/setup-master.sh && /tmp/setup-master.sh'"
  }
}

# Kubeconfig 가져오기
resource "null_resource" "get_kubeconfig" {
  depends_on = [null_resource.setup_master]

  provisioner "local-exec" {
    command = <<EOT
      mkdir -p ${path.module}/.kube
      limactl shell k8s-master sudo cat /etc/kubernetes/admin.conf > ${path.module}/.kube/config 
      sed -i '' 's|server: https://.*:6443|server: https://127.0.0.1:6443|' ${path.module}/.kube/config
      chmod 600 ${path.module}/.kube/config
    EOT
  }
}

# Join 커맨드 가져오기
data "external" "join_command" {
  depends_on = [null_resource.setup_master]
  program    = ["bash", "-c", "echo '{\"output\": \"'$(limactl shell k8s-master sudo cat /root/join-command.sh)'\"}'"]
}

# Worker 노드 IP 가져오기
data "external" "worker_ip" {
  depends_on = [null_resource.create_worker]

  program = ["bash", "-c", <<EOT
limactl shell k8s-worker ip addr show lima0 | grep "inet " | awk '{print $2}' | cut -d'/' -f1 | jq -R -c '{ "output": . }'
EOT
  ]
}

resource "null_resource" "setup_worker" {
  depends_on = [data.external.join_command, data.external.worker_ip]

  provisioner "local-exec" {
    command = "limactl copy ${path.module}/scripts/setup-worker.sh k8s-worker:/tmp/setup-worker.sh"
  }

  provisioner "local-exec" {
    command = <<EOT
      # 기본 설정
      limactl shell k8s-worker sudo bash -c 'chmod +x /tmp/setup-worker.sh && /tmp/setup-worker.sh'
      sleep 10
      # Join 실행
      limactl shell k8s-worker sudo bash -c '${data.external.join_command.result["output"]}'
      sleep 10
      # kubelet 재시작
      limactl shell k8s-worker sudo systemctl restart kubelet
    EOT
  }
}

output "master_ip" {
  value = data.external.master_ip.result["output"]
}

output "worker_ip" {
  value = data.external.worker_ip.result["output"]
}

output "kubeconfig_path" {
  value = "${path.module}/.kube/config"
}
