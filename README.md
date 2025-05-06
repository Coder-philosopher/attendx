# SolanaPOP: Proof of Participation Tokens

A full-stack decentralized application (dApp) built on Solana blockchain that implements a Proof-of-Participation (POP) token system using Solana's ZK Compression primitives.

## Overview

SolanaPOP allows event creators to mint compressed NFTs (cNFTs) for their events and generate unique QR codes that attendees can scan to claim their proof of participation tokens. These tokens serve as verifiable proof that someone attended a specific event, suitable for conferences, workshops, meetups, and more.

## Features

- **Event Creation**: Event organizers can create events with details like name, description, date, and maximum attendees.
- **Compressed Token Minting**: Utilizes Solana's ZK Compression for gas-efficient token creation.
- **QR Code Generation**: Each event gets a unique QR code that attendees can scan to claim tokens.
- **Wallet Integration**: Seamless connection with Phantom wallet for Solana blockchain interactions.
- **Token Collection**: Users can view all their collected participation tokens in one place.
- **Persistent Storage**: All event and token claim data is stored in MongoDB.

## Technology Stack

### Frontend
- React with TypeScript
- TanStack Query for data fetching and cache management
- Shadcn UI components with Tailwind CSS for styling
- Wouter for routing
- Vite for bundling and development environment

### Backend
- Express.js server
- MongoDB for data persistence (with fallback to in-memory storage)
- Drizzle ORM with Zod for schema validation
- WebSockets for real-time updates

### Blockchain
- Solana Web3.js for blockchain interactions
- Solana Wallet Adapter for wallet connections
- Helius API for Solana ZK Compression operations

## Prerequisites

- Node.js 20.x or later
- MongoDB database (optional, app will fall back to in-memory storage)
- Phantom wallet browser extension for Solana interactions
- Helius API key for ZK Compression operations

## Environment Variables

The following environment variables are required:

- `DATABASE_URL`: PostgreSQL connection string (optional)
- `MONGODB_URI`: MongoDB connection string (optional)
- `HELIUS_API_KEY`: API key for Helius API integration

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables in `.env` file
4. Start the development server:
   ```
   npm run dev
   ```

## Usage Flow

### For Event Creators
1. Connect your Solana wallet
2. Navigate to "Create Event" page
3. Fill in event details and submit
4. A compressed NFT is minted for your event
5. Share the event's QR code with attendees

### For Event Attendees
1. Connect your Solana wallet
2. Scan the event's QR code
3. Approve the transaction to claim your token
4. View your collected tokens in "My Tokens" page

## Project Structure

- `/client`: Frontend React application
  - `/src/components`: Reusable UI components
  - `/src/pages`: Application pages
  - `/src/lib`: Utility functions and API clients
  - `/src/providers`: Context providers
  - `/src/hooks`: Custom React hooks

- `/server`: Backend Express server
  - `index.ts`: Entry point for the server
  - `routes.ts`: API route definitions
  - `storage.ts`: Data storage interface
  - `mongodb-storage.ts`: MongoDB storage implementation
  - `db.ts`: Database connection setup

- `/shared`: Code shared between frontend and backend
  - `schema.ts`: Data models and validation schemas

## Development

### Running the Development Server

```
npm run dev
```

This starts both the frontend and backend in development mode.

### Database Management

The application can use either in-memory storage (for development) or MongoDB (for production). If `MONGODB_URI` is provided, the app will use MongoDB; otherwise, it will fall back to in-memory storage.

## Blockchain Integration Details

### Solana Network

The application connects to Solana's devnet by default. For production use, you would need to update the network to mainnet in the `solana.ts` file.

### ZK Compression

The app uses Solana's ZK Compression primitives through the Helius API to mint and manage compressed NFTs, which significantly reduces gas costs compared to traditional NFTs.

## Security Considerations

- Private keys never leave the user's wallet
- All transactions require explicit user approval
- Backend validates all requests with proper error handling
- Implements rate limiting on API endpoints to prevent abuse

## License

MIT

## Acknowledgments

- Solana Foundation for the blockchain platform
- Helius API for ZK Compression support
- Shadcn UI for the component library