FROM cimg/node:14.19.1-browsers AS builder

WORKDIR /app
ENV NODE_ENV=production

RUN sudo apt-get update

# Install JDK
RUN sudo apt install -y openjdk-11-jdk-headless

# Install AWS CLI
RUN sudo apt-get install awscli

# Install additional tools
RUN sudo apt-get install -y libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb

# Install browsers
# Firefox
RUN sudo apt install firefox
# Chrome
RUN sudo wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN sudo dpkg -i google-chrome-stable_current_amd64.deb
# Edge
#RUN sudo curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
#RUN sudo install -o root -g root -m 644 microsoft.gpg /etc/apt/trusted.gpg.d/
#RUN sudo sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/edge stable main" > /etc/apt/sources.list.d/microsoft-edge-dev.list'
#RUN sudo rm microsoft.gpg
#RUN sudo apt update && sudo apt install microsoft-edge-stable

# Github CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
RUN echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
RUN sudo apt update
RUN sudo apt -y install gh