#!/bin/bash
set -e

# 시스템 설정
swapoff -a
sed -i "/ swap / s/^/#/" /etc/fstab

# 커널 모듈 설정
modprobe overlay
modprobe br_netfilter

# 시스템 파라미터 설정
cat <<EOF > /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF
sysctl --system

# containerd 설정
mkdir -p /etc/containerd
containerd config default > /etc/containerd/config.toml
sed -i "s/SystemdCgroup = false/SystemdCgroup = true/" /etc/containerd/config.toml
systemctl restart containerd

# Kubernetes 설치
mkdir -p /etc/apt/keyrings
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.31/deb/Release.key | gpg --yes --dearmor -o /etc/apt/keyrings/kubernetes-archive-keyring.gpg
echo "deb [signed-by=/etc/apt/keyrings/kubernetes-archive-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.31/deb/ /" > /etc/apt/sources.list.d/kubernetes.list
apt-get update
apt-get install -y kubelet kubeadm kubectl
apt-mark hold kubelet kubeadm kubectl

# kubelet 설정
cat <<EOF > /etc/default/kubelet
KUBELET_EXTRA_ARGS=--node-ip=$(hostname -I | awk '{print $1}')
EOF
systemctl daemon-reload
systemctl restart kubelet

# kubeadm 초기화
kubeadm init --pod-network-cidr=192.168.0.0/16 \
  --apiserver-advertise-address=$(hostname -I | awk '{print $1}') \
  --apiserver-cert-extra-sans=127.0.0.1 \
  --apiserver-cert-extra-sans=localhost

# kubeconfig 설정
export KUBECONFIG=/etc/kubernetes/admin.conf

# calico 설치
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.0/manifests/tigera-operator.yaml
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.0/manifests/custom-resources.yaml

# join 커맨드 저장
kubeadm token create --print-join-command > /root/join-command.sh
chmod 644 /etc/kubernetes/admin.conf
