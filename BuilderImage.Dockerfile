FROM cimg/node:22.20.0-browsers

USER root

WORKDIR /app

# Install Other tools: JDK, AWS CLI v2, GitHub CLI
RUN apt-get update && \
    apt-get install -y openjdk-11-jdk-headless unzip curl && \
    # Install AWS CLI v2
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf awscliv2.zip aws && \
    # Install GitHub CLI
    curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null && \
    apt-get update && apt-get install -y gh

# Tools/Dependencies needed for Browsers
RUN apt-get install -y libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libnss3 libxss1 libasound2t64 libxtst6 xauth xvfb libu2f-udev

# Install Yarn via Corepack
RUN corepack enable

# Install Browsers.
#Chrome
RUN wget -qO- https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -O google-chrome-stable_current_amd64.deb && \
    dpkg -i google-chrome-stable_current_amd64.deb || apt-get -f install -y

# Install Browsers.
# Edge
RUN curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg && \
    install -o root -g root -m 644 microsoft.gpg /etc/apt/trusted.gpg.d/ && \
    sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/edge stable main" > /etc/apt/sources.list.d/microsoft-edge.list' && \
    rm microsoft.gpg && \
    apt-get update -y && \
    apt-get install -y microsoft-edge-stable

# Firefox
RUN wget --no-verbose -O /tmp/firefox.tar.xz 'https://download.mozilla.org/?product=firefox-latest-ssl&os=linux64&lang=en-US' \
    && tar -C /opt -xf /tmp/firefox.tar.xz \
    && rm /tmp/firefox.tar.xz \
    && chmod +x /opt/firefox \
    && mv /opt/firefox /opt/firefox-latest \
    && ln -fs /opt/firefox-latest/firefox /usr/bin/firefox
USER circleci
