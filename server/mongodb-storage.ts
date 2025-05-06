import { IStorage } from './storage';
import { Event, InsertEvent, TokenClaim, InsertTokenClaim } from '@shared/schema';
import { EventModel, TokenClaimModel } from './mongodb';
import mongoose from 'mongoose';

export class MongoDBStorage implements IStorage {
  // Event operations
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const newEvent = new EventModel(insertEvent);
    const savedEvent = await newEvent.save();
    
    return this.mongoEventToEvent(savedEvent);
  }

  async getEvent(id: number): Promise<Event | undefined> {
    try {
      const event = await EventModel.findById(id);
      return event ? this.mongoEventToEvent(event) : undefined;
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        return undefined;
      }
      throw error;
    }
  }

  async getEventByMintAddress(tokenMintAddress: string): Promise<Event | undefined> {
    const event = await EventModel.findOne({ tokenMintAddress });
    return event ? this.mongoEventToEvent(event) : undefined;
  }

  async getEvents(): Promise<Event[]> {
    const events = await EventModel.find().sort({ createdAt: -1 });
    return events.map(event => this.mongoEventToEvent(event));
  }

  async getEventsByCreator(creatorAddress: string): Promise<Event[]> {
    const events = await EventModel.find({ creator: creatorAddress }).sort({ createdAt: -1 });
    return events.map(event => this.mongoEventToEvent(event));
  }

  // TokenClaim operations
  async createTokenClaim(insertTokenClaim: InsertTokenClaim): Promise<TokenClaim> {
    const newTokenClaim = new TokenClaimModel({
      ...insertTokenClaim,
      // Convert numeric eventId to ObjectId if needed
      eventId: mongoose.Types.ObjectId.isValid(insertTokenClaim.eventId.toString()) 
        ? insertTokenClaim.eventId 
        : new mongoose.Types.ObjectId()
    });
    
    const savedTokenClaim = await newTokenClaim.save();
    return this.mongoTokenClaimToTokenClaim(savedTokenClaim);
  }

  async getTokenClaim(id: number): Promise<TokenClaim | undefined> {
    try {
      const tokenClaim = await TokenClaimModel.findById(id);
      return tokenClaim ? this.mongoTokenClaimToTokenClaim(tokenClaim) : undefined;
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        return undefined;
      }
      throw error;
    }
  }

  async getTokenClaimsByEvent(eventId: number): Promise<TokenClaim[]> {
    const tokenClaims = await TokenClaimModel.find({ eventId });
    return tokenClaims.map(claim => this.mongoTokenClaimToTokenClaim(claim));
  }

  async getTokenClaimsByWallet(walletAddress: string): Promise<TokenClaim[]> {
    const tokenClaims = await TokenClaimModel.find({ walletAddress });
    return tokenClaims.map(claim => this.mongoTokenClaimToTokenClaim(claim));
  }

  async hasWalletClaimedToken(eventId: number, walletAddress: string): Promise<boolean> {
    const count = await TokenClaimModel.countDocuments({ 
      eventId,
      walletAddress 
    });
    return count > 0;
  }

  // Helper methods to convert between MongoDB documents and our types
  private mongoEventToEvent(mongoEvent: any): Event {
    return {
      id: mongoEvent._id.toString(),
      name: mongoEvent.name,
      description: mongoEvent.description,
      date: new Date(mongoEvent.date),
      creator: mongoEvent.creator,
      tokenMintAddress: mongoEvent.tokenMintAddress,
      qrCodeData: mongoEvent.qrCodeData,
      maxAttendees: mongoEvent.maxAttendees,
      imageUrl: mongoEvent.imageUrl,
      createdAt: new Date(mongoEvent.createdAt)
    };
  }

  private mongoTokenClaimToTokenClaim(mongoTokenClaim: any): TokenClaim {
    return {
      id: mongoTokenClaim._id.toString(),
      eventId: mongoTokenClaim.eventId.toString(),
      walletAddress: mongoTokenClaim.walletAddress,
      transactionSignature: mongoTokenClaim.transactionSignature,
      claimedAt: new Date(mongoTokenClaim.claimedAt)
    };
  }
}