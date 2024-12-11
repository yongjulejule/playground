# 클러스터 맹글기

## Requirements

- lima (가상머신):
  - 노드들을 운영하기 위한 가상머신
  - `brew install lima`
- socket_vmnet:
  - lima의 네트워크를 사용하기 위한 소켓
  - `bash install_socket_vmnet.sh` 혹은 lima 공식문서 참고

## Usage

terraform init

terraform apply

성공하면 kubeconfig 파일이 생성됨

`export KUBECONFIG=$(pwd)/.kube/config`
`kubectl get nodes`

노드들이 생성되어 있으면 성공
