import { exec } from 'child_process';
import { promisify } from 'util';
import { db } from './database';

const execAsync = promisify(exec);

export class DatabaseMigration {
  /**
   * Generate Prisma client
   */
  static async generateClient(): Promise<void> {
    try {
      console.log('📦 Generating Prisma client...');
      await execAsync('npx prisma generate');
      console.log('✅ Prisma client generated successfully');
    } catch (error) {
      console.error('❌ Failed to generate Prisma client:', error);
      throw error;
    }
  }

  /**
   * Run database migrations
   */
  static async migrate(name?: string): Promise<void> {
    try {
      console.log('🚀 Running database migrations...');
      const command = name 
        ? `npx prisma migrate dev --name ${name}`
        : 'npx prisma migrate dev';
      
      await execAsync(command);
      console.log('✅ Database migrations completed successfully');
    } catch (error) {
      console.error('❌ Failed to run migrations:', error);
      throw error;
    }
  }

  /**
   * Deploy migrations to production
   */
  static async deployMigrations(): Promise<void> {
    try {
      console.log('🚀 Deploying migrations to production...');
      await execAsync('npx prisma migrate deploy');
      console.log('✅ Production migrations deployed successfully');
    } catch (error) {
      console.error('❌ Failed to deploy migrations:', error);
      throw error;
    }
  }

  /**
   * Push schema changes to database (for prototyping)
   */
  static async pushSchema(): Promise<void> {
    try {
      console.log('📤 Pushing schema changes to database...');
      await execAsync('npx prisma db push');
      console.log('✅ Schema pushed successfully');
    } catch (error) {
      console.error('❌ Failed to push schema:', error);
      throw error;
    }
  }

  /**
   * Reset database and run migrations
   */
  static async resetDatabase(): Promise<void> {
    try {
      console.log('🔄 Resetting database...');
      await execAsync('npx prisma migrate reset --force');
      console.log('✅ Database reset completed');
    } catch (error) {
      console.error('❌ Failed to reset database:', error);
      throw error;
    }
  }

  /**
   * Check database connection
   */
  static async checkConnection(): Promise<boolean> {
    try {
      await db.$connect();
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    } finally {
      await db.$disconnect();
    }
  }

  /**
   * Validate schema
   */
  static async validateSchema(): Promise<void> {
    try {
      console.log('🔍 Validating database schema...');
      await execAsync('npx prisma validate');
      console.log('✅ Schema validation passed');
    } catch (error) {
      console.error('❌ Schema validation failed:', error);
      throw error;
    }
  }

  /**
   * Create a new migration
   */
  static async createMigration(name: string): Promise<void> {
    try {
      console.log(`📝 Creating migration: ${name}`);
      await execAsync(`npx prisma migrate dev --name ${name} --create-only`);
      console.log('✅ Migration created successfully');
    } catch (error) {
      console.error('❌ Failed to create migration:', error);
      throw error;
    }
  }

  /**
   * Get migration status
   */
  static async getMigrationStatus(): Promise<void> {
    try {
      console.log('📊 Checking migration status...');
      const { stdout } = await execAsync('npx prisma migrate status');
      console.log(stdout);
    } catch (error) {
      console.error('❌ Failed to get migration status:', error);
      throw error;
    }
  }

  /**
   * Format schema file
   */
  static async formatSchema(): Promise<void> {
    try {
      console.log('🎨 Formatting schema file...');
      await execAsync('npx prisma format');
      console.log('✅ Schema formatted successfully');
    } catch (error) {
      console.error('❌ Failed to format schema:', error);
      throw error;
    }
  }

  /**
   * Run full database setup (for new environments)
   */
  static async setupDatabase(): Promise<void> {
    try {
      console.log('🛠️  Setting up database...');
      
      // Check connection first
      const isConnected = await this.checkConnection();
      if (!isConnected) {
        throw new Error('Cannot connect to database');
      }

      // Validate schema
      await this.validateSchema();

      // Generate client
      await this.generateClient();

      // Push schema (for development)
      if (process.env.NODE_ENV !== 'production') {
        await this.pushSchema();
      } else {
        await this.deployMigrations();
      }

      console.log('🎉 Database setup completed successfully!');
    } catch (error) {
      console.error('❌ Database setup failed:', error);
      throw error;
    }
  }
}

// CLI interface
const command = process.argv[2];
const args = process.argv.slice(3);

if (require.main === module) {
  (async () => {
    try {
      switch (command) {
        case 'generate':
          await DatabaseMigration.generateClient();
          break;
        case 'migrate':
          await DatabaseMigration.migrate(args[0]);
          break;
        case 'deploy':
          await DatabaseMigration.deployMigrations();
          break;
        case 'push':
          await DatabaseMigration.pushSchema();
          break;
        case 'reset':
          await DatabaseMigration.resetDatabase();
          break;
        case 'validate':
          await DatabaseMigration.validateSchema();
          break;
        case 'create':
          if (!args[0]) {
            console.error('❌ Migration name is required');
            process.exit(1);
          }
          await DatabaseMigration.createMigration(args[0]);
          break;
        case 'status':
          await DatabaseMigration.getMigrationStatus();
          break;
        case 'format':
          await DatabaseMigration.formatSchema();
          break;
        case 'setup':
          await DatabaseMigration.setupDatabase();
          break;
        case 'check':
          await DatabaseMigration.checkConnection();
          break;
        default:
          console.log(`
🗄️  Database Migration Utility

Usage: tsx src/lib/migrate.ts <command> [options]

Commands:
  generate     Generate Prisma client
  migrate      Run database migrations
  deploy       Deploy migrations to production
  push         Push schema changes to database
  reset        Reset database and run migrations
  validate     Validate database schema
  create       Create a new migration
  status       Check migration status
  format       Format schema file
  setup        Full database setup
  check        Check database connection

Examples:
  tsx src/lib/migrate.ts generate
  tsx src/lib/migrate.ts migrate init
  tsx src/lib/migrate.ts create add-user-preferences
  tsx src/lib/migrate.ts setup
          `);
          break;
      }
    } catch (error) {
      console.error('❌ Command failed:', error);
      process.exit(1);
    }
  })();
}
