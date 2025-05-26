import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeederService } from './seeder/seeder.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const seederService = app.get(SeederService);

  try {
    // Delete existing entries before seeding
    await seederService.deleteAll();
    console.log('Existing data deleted successfully!');

    // Seed new data
    await seederService.seed();
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during database operation:', error);
  } finally {
    await app.close();
  }
}

bootstrap();