# VideoPlatform

```mermaid
flowchart LR
    subgraph Development_Workstation [Development Workstation]
        Docker_Runtime[Docker Runtime]
        Video_Streaming[Video Streaming]
        Video_Storage[Video Storage]
        RabbitMQ[(RabbitMQ Queue)]
        History[History]

        Docker_Runtime --> RabbitMQ
        Docker_Runtime --> Video_Storage
        Docker_Runtime --> Video_Streaming
        RabbitMQ --> History
    end

    Client[Client] -->|Requests| Video_Streaming
    Video_Streaming -->|Microservice Message Flow| Docker_Runtime
```

# k8s

## Cluster 배포

infra/cluster 참고

## K8s 인프라

### MongoDB

- pv 생성 (helm/mongo/pv.yaml)
- pvc 생성 (helm/mongo/pvc.yaml)
- helm install mongo bitnami/mongodb -f helm/mongo/values.yaml

```bash
kubectl apply -f helm/mongo/pv.yaml
kubectl apply -f helm/mongo/pvc.yaml
helm install mongo bitnami/mongodb -f helm/mongo/values.yaml
```

**troubleshooting**

- pv / pvc 만들어줘야함
- bitnami/mongodb docker image 가 arm64 지원 안함 -> mongo 이미지로 변경
- 만들어진 pv / pvc 가 노드의 /mnt/data 에 바인드 되는데, 이때 권한때문에 막힘
  - 노드에 직접 접속해서 권한 바꿔주면 됨 (sudo chown -R 1001:1001 /mnt/data/mongo)

### 내 서비스

- helm create apps 로 helm chart 생성
- values.yaml 에 기본 values 설정
- video-streaming.yaml, history.yaml 에 서비스 별 필요한 값 설정
- template/deployment.yaml 에서 env 설정
- helm upgrade --install ./helm/apps -f ./helm/apps/<service values>.yaml

### RabbitMQ

### MINIO

- helm repo add minio https://charts.min.io/
- helm repo update
- values.yaml 에서 accessKey, secretKey 설정
- storageClass 만들기 (뭔지 잘 모르겠음)
- pv, pvc 생성
  - 디렉토리 권한 체크하기
  - storageClassName 체크
- helm install video-storage minio/minio -f ./values.yaml

### Helm

- helm install 로 워크로드 배포 가능
- helm list 로 배포된 워크로드 확인 가능
- helm status <workload name> 로 워크로드 상세 확인 가능
