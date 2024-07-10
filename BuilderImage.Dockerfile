FROM cimg/node:20.15.1-browsers

USER root

WORKDIR /app


#Install Other tools. JDK, awscli, githubcli
RUN apt-get update && \
    apt install -y openjdk-11-jdk-headless && \
    apt-get install -y awscli && \
    #Github CLI
    curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null && \
    apt update && \
    apt -y install gh

# Tools/Dependencies needed for Browser
RUN apt-get install -y libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb libu2f-udev

# Install Yarn via Corepack
RUN corepack enable

# Install Browsers.
#Chrome
ARG CHROME_VERSION="120.0.6099.129"
RUN wget https://dl.google.com/linux/chrome/deb/pool/main/g/google-chrome-stable/google-chrome-stable_$CHROME_VERSION-1_amd64.deb && \
    dpkg -i google-chrome-stable_$CHROME_VERSION-1_amd64.deb || apt-get -f install -y


#Edge
RUN curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg && \
    install -o root -g root -m 644 microsoft.gpg /etc/apt/trusted.gpg.d/ && \
    sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/edge stable main" > /etc/apt/sources.list.d/microsoft-edge-dev.list' && \
    rm microsoft.gpg && \
    apt-get update -y && \
    apt-get install -y microsoft-edge-stable


#Firefox
ARG FIREFOX_VERSION="121.0"
RUN apt-get -qqy --no-install-recommends install firefox \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt/* \
  && wget --no-verbose -O /tmp/firefox.tar.bz2 https://download-installer.cdn.mozilla.net/pub/firefox/releases/$FIREFOX_VERSION/linux-x86_64/en-US/firefox-$FIREFOX_VERSION.tar.bz2 \
  && wget --no-verbose -O /tmp/firefox.tar.bz2.asc https://download-installer.cdn.mozilla.net/pub/firefox/releases/$FIREFOX_VERSION/linux-x86_64/en-US/firefox-$FIREFOX_VERSION.tar.bz2.asc \
  && curl  https://download-installer.cdn.mozilla.net/pub/firefox/releases/$FIREFOX_VERSION/KEY | gpg --import >/dev/null 2>&1 \
  && gpg --verify  /tmp/firefox.tar.bz2.asc /tmp/firefox.tar.bz2 \
  && apt-get -y purge firefox \
  && rm -rf /opt/firefox \
  && tar -C /opt -xjf /tmp/firefox.tar.bz2 \
  && rm /tmp/firefox.tar.bz2 \
  && chmod +x /opt/firefox \
  && mv /opt/firefox /opt/firefox-$FIREFOX_VERSION \
  && ln -fs /opt/firefox-$FIREFOX_VERSION/firefox /usr/bin/firefox

USER circleci
