
start-cluster:
	limactl start k8s-master
	limactl start k8s-worker
	echo 'export $(pwd)/.kube/config\nto use kubectl' 

stop-cluster:
	limactl stop k8s-master
	limactl stop k8s-worker


helm-install:
	helm upgrade --install video-streaming ./helm/apps -f ./helm/apps/video-streaming.dev.values.yaml
	helm upgrade --install history ./helm/apps -f ./helm/apps/history.dev.values.yaml


