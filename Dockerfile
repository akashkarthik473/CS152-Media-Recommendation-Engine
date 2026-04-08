FROM ubuntu:latest
LABEL authors="Robel"

# Pull the Node.js Docker image:
docker pull node:24-slim
# Create a Node.js container and start a Shell session:
docker run -it --rm --entrypoint sh node:24-slim
# Verify the Node.js version:
node -v # Should print "v24.14.1".
# Verify npm version:
npm -v # Should print "11.11.0".

ENTRYPOINT ["top", "-b"]