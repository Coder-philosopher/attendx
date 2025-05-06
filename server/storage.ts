import { events, type Event, type InsertEvent, tokenClaims, type TokenClaim, type InsertTokenClaim } from "@shared/schema";

// Storage interface for Event and TokenClaim operations
export interface IStorage {
  // Event operations
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: number): Promise<Event | undefined>;
  getEventByMintAddress(tokenMintAddress: string): Promise<Event | undefined>;
  getEvents(): Promise<Event[]>;
  getEventsByCreator(creatorAddress: string): Promise<Event[]>;
  
  // TokenClaim operations
  createTokenClaim(claim: InsertTokenClaim): Promise<TokenClaim>;
  getTokenClaim(id: number): Promise<TokenClaim | undefined>;
  getTokenClaimsByEvent(eventId: number): Promise<TokenClaim[]>;
  getTokenClaimsByWallet(walletAddress: string): Promise<TokenClaim[]>;
  hasWalletClaimedToken(eventId: number, walletAddress: string): Promise<boolean>;
}

// In-memory implementation of the storage interface
export class MemStorage implements IStorage {
  private events: Map<number, Event>;
  private tokenClaims: Map<number, TokenClaim>;
  private eventCurrentId: number;
  private tokenClaimCurrentId: number;

  constructor() {
    this.events = new Map();
    this.tokenClaims = new Map();
    this.eventCurrentId = 1;
    this.tokenClaimCurrentId = 1;
  }

  // Event operations
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventCurrentId++;
    const createdAt = new Date();
    const event: Event = { ...insertEvent, id, createdAt };
    this.events.set(id, event);
    return event;
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getEventByMintAddress(tokenMintAddress: string): Promise<Event | undefined> {
    return Array.from(this.events.values()).find(
      (event) => event.tokenMintAddress === tokenMintAddress
    );
  }

  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getEventsByCreator(creatorAddress: string): Promise<Event[]> {
    return Array.from(this.events.values())
      .filter((event) => event.creator === creatorAddress)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // TokenClaim operations
  async createTokenClaim(insertTokenClaim: InsertTokenClaim): Promise<TokenClaim> {
    const id = this.tokenClaimCurrentId++;
    const claimedAt = new Date();
    const tokenClaim: TokenClaim = { ...insertTokenClaim, id, claimedAt };
    this.tokenClaims.set(id, tokenClaim);
    return tokenClaim;
  }

  async getTokenClaim(id: number): Promise<TokenClaim | undefined> {
    return this.tokenClaims.get(id);
  }

  async getTokenClaimsByEvent(eventId: number): Promise<TokenClaim[]> {
    return Array.from(this.tokenClaims.values())
      .filter((claim) => claim.eventId === eventId)
      .sort((a, b) => new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime());
  }

  async getTokenClaimsByWallet(walletAddress: string): Promise<TokenClaim[]> {
    return Array.from(this.tokenClaims.values())
      .filter((claim) => claim.walletAddress === walletAddress)
      .sort((a, b) => new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime());
  }

  async hasWalletClaimedToken(eventId: number, walletAddress: string): Promise<boolean> {
    return Array.from(this.tokenClaims.values()).some(
      (claim) => claim.eventId === eventId && claim.walletAddress === walletAddress
    );
  }
}

// Export a singleton instance for use throughout the application
export const storage = new MemStorage();
