#!/usr/bin/env bash
# Install socket_vmnet as root from source to /opt/socket_vmnet
# using instructions on https://github.com/lima-vm/socket_vmnet
# This assumes that Xcode Command Line Tools are already installed
git clone https://github.com/lima-vm/socket_vmnet
cd socket_vmnet
# Change "v1.2.0" to the actual latest release in https://github.com/lima-vm/socket_vmnet/releases
git checkout v1.2.0
make
sudo make PREFIX=/opt/socket_vmnet install.bin

# Set up the sudoers file for launching socket_vmnet from Lima
limactl sudoers >etc_sudoers.d_lima
sudo install -o root etc_sudoers.d_lima /etc/sudoers.d/lima
rm etc_sudoers.d_lima

cd ..
rm -rf socket_vmnet
