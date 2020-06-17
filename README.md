# nci-webtools-dceg-SpatialPower
CBIIT DCEG spatial power calculation tool

### Getting Started

#### Install Dependencies
Ensure that R is in your path.

```bash
npm install
npm run install-r-packages # May need to run in administrative terminal on Windows
cd client
npm install
```

#### Create Configuration File
```bash
cd server
cp config.example.json config.json
# Update config.json with properties specific to your environment
```

#### Start Server
```bash
npm start
# Server runs on port 4000 by default
```

#### Start Queue Worker
```bash
npm run start-queue-worker
# Queue worker listens to an SQS Endpoint
```

#### Start Client
```bash
cd client
npm start
# Client runs on port 3000 by default
```