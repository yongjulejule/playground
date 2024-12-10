#!/bin/bash
set -e

# 시스템 설정
swapoff -a
sed -i "/ swap / s/^/#/" /etc/fstab

# 커널 모듈 설정
modprobe overlay
modprobe br_netfilter

# 시스템 파라미터 설정
cat <<EOF >/etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF
sysctl --system

# containerd 설정
mkdir -p /etc/containerd
containerd config default >/etc/containerd/config.toml
sed -i "s/SystemdCgroup = false/SystemdCgroup = true/" /etc/containerd/config.toml
systemctl restart containerd

# Kubernetes 패키지 저장소 추가
mkdir -p /etc/apt/keyrings
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.31/deb/Release.key | gpg --yes --dearmor -o /etc/apt/keyrings/kubernetes-archive-keyring.gpg
echo "deb [signed-by=/etc/apt/keyrings/kubernetes-archive-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.31/deb/ /" >/etc/apt/sources.list.d/kubernetes.list

# kubelet, kubeadm 설치
apt-get update
apt-get install -y kubelet kubeadm
apt-mark hold kubelet kubeadm

# 기본 kubelet 설정
mkdir -p /var/lib/kubelet/
cat >/var/lib/kubelet/config.yaml <<EOF
apiVersion: kubelet.config.k8s.io/v1beta1
kind: KubeletConfiguration
cgroupDriver: systemd
EOF

NODE_IP=$(ip addr show lima0 | grep "inet " | awk '{print $2}' | cut -d '/' -f1 )
# kubelet 설정
cat >/etc/default/kubelet <<EOF
KUBELET_EXTRA_ARGS=--node-ip=$NODE_IP --config=/var/lib/kubelet/config.yaml
EOF

# kubelet 시작 전 설정 적용
systemctl daemon-reload
systemctl enable kubelet
