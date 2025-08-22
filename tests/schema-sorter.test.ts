import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { sortPrismaSchema } from '../src/lib/index';

describe('Prisma Schema Sorter', () => {
  const testDir = join(__dirname, 'temp');
  const testSchemaPath = join(testDir, 'schema.prisma');

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true });
  });

  describe('basic sorting functionality', () => {
    it('should sort models alphabetically', async () => {
      const inputSchema = `
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
}

model Post {
  id     Int    @id @default(autoincrement())
  title  String
}

model Comment {
  id   Int    @id @default(autoincrement())
  text String
}
`;

      const expectedOrder = ['Comment', 'Post', 'User'];
      
      await fs.writeFile(testSchemaPath, inputSchema);
      await sortPrismaSchema(testSchemaPath);
      
      const sortedSchema = await fs.readFile(testSchemaPath, 'utf-8');
      
      const modelMatches = sortedSchema.matchAll(/model (\w+) \{/g);
      const modelNames = Array.from(modelMatches).map(match => match[1]);
      
      expect(modelNames).toEqual(expectedOrder);
    });

    it('should not add blank lines at the start of file', async () => {
      const inputSchema = `generator client {
  provider = "prisma-client-js"
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
}`;

      await fs.writeFile(testSchemaPath, inputSchema);
      await sortPrismaSchema(testSchemaPath);
      
      const sortedSchema = await fs.readFile(testSchemaPath, 'utf-8');
      
      expect(sortedSchema).not.toMatch(/^\s*\n/);
      expect(sortedSchema.startsWith('generator') || sortedSchema.startsWith('datasource') || sortedSchema.startsWith('model') || sortedSchema.startsWith('enum')).toBe(true);
    });
  });

  describe('issue #9 - enum map properties', () => {
    it('should preserve enum map properties correctly', async () => {
      const inputSchema = `enum CheckoutStatus {
  COMPLETE @map("complete")
  EXPIRE   @map("expire") 
  OPEN     @map("open")
}`;

      const expectedOutput = `enum CheckoutStatus {
  COMPLETE @map("complete")
  EXPIRE @map("expire")
  OPEN @map("open")
}`;

      await fs.writeFile(testSchemaPath, inputSchema);
      await sortPrismaSchema(testSchemaPath);
      
      const sortedSchema = await fs.readFile(testSchemaPath, 'utf-8').then(content => content.trim());
      
      expect(sortedSchema).toBe(expectedOutput.trim());
    });

    it('should handle multiple enums with map properties', async () => {
      const inputSchema = `enum Status {
  ACTIVE   @map("active")
  INACTIVE @map("inactive")
}

enum Role {
  ADMIN @map("admin")
  USER  @map("user")
}`;

      await fs.writeFile(testSchemaPath, inputSchema);
      await sortPrismaSchema(testSchemaPath);
      
      const sortedSchema = await fs.readFile(testSchemaPath, 'utf-8');
      
      // Should not separate enum values from their @map attributes
      expect(sortedSchema).not.toMatch(/ACTIVE\s*\n\s*@map/);
      expect(sortedSchema).not.toMatch(/INACTIVE\s*\n\s*@map/);
      expect(sortedSchema).not.toMatch(/ADMIN\s*\n\s*@map/);
      expect(sortedSchema).not.toMatch(/USER\s*\n\s*@map/);
      
      // Should keep enum values with their @map on the same line
      expect(sortedSchema).toMatch(/ACTIVE\s+@map\("active"\)/);
      expect(sortedSchema).toMatch(/INACTIVE\s+@map\("inactive"\)/);
      expect(sortedSchema).toMatch(/ADMIN\s+@map\("admin"\)/);
      expect(sortedSchema).toMatch(/USER\s+@map\("user"\)/);
    });
  });

  describe('issue #8 - blank line behavior', () => {
    it('should not add blank line at the top of the file', async () => {
      const inputSchema = `model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
}`;

      await fs.writeFile(testSchemaPath, inputSchema);
      await sortPrismaSchema(testSchemaPath);
      
      const sortedSchema = await fs.readFile(testSchemaPath, 'utf-8');
      
      expect(sortedSchema).not.toMatch(/^\s*\n/);
    });
  });
});