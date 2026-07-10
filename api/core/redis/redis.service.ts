import { Injectable, Inject } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext('RedisService');
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.redis.setEx(key, ttl, value);
      } else {
        await this.redis.set(key, value);
      }
    } catch (error) {
      this.logger.error(`Failed to set cache for key: ${key}`, error.stack);
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      this.logger.error(`Failed to get cache for key: ${key}`, error.stack);
      throw error;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete cache for key: ${key}`, error.stack);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check cache existence for key: ${key}`, error.stack);
      throw error;
    }
  }

  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    try {
      const cached = await this.get(key);
      if (cached) {
        this.logger.log(`Cache hit for key: ${key}`);
        return JSON.parse(cached) as T;
      }

      this.logger.log(`Cache miss for key: ${key}, fetching from DB`);
      const data = await fetchFn();
      await this.set(key, JSON.stringify(data), ttl);
      this.logger.log(`Cache set for key: ${key}`);
      return data;
    } catch (error) {
      this.logger.error(`Failed in getOrSet for key: ${key}`, error.stack);
      throw error;
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(keys);
        this.logger.log(`Invalidated ${keys.length} cache keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      this.logger.error(`Failed to invalidate cache pattern: ${pattern}`, error.stack);
      throw error;
    }
  }

  async clearAllDataCache(): Promise<void> {
    try {
      const allKeys = await this.redis.keys('*');
      const tokenKeys = allKeys.filter(key => key.includes('refresh_token') || key.includes('access_token'));
      const dataKeys = allKeys.filter(key => !key.includes('refresh_token') && !key.includes('access_token'));
      
      if (dataKeys.length > 0) {
        await this.redis.del(dataKeys);
        this.logger.log(`Cleared ${dataKeys.length} data cache keys (kept ${tokenKeys.length} token keys)`);
      }
    } catch (error) {
      this.logger.error(`Failed to clear all data cache`, error.stack);
      throw error;
    }
  }
}
