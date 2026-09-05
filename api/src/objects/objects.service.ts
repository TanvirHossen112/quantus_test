import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectEntity } from './entities/object.entity.js';
import { QuantityService } from './quantity.service.js';
import { CreateObjectDto } from './dto/create-object.dto.js';
import { UpdateObjectDto } from './dto/update-object.dto.js';
import { ObjectResponse } from './interfaces/object-response.interface.js';

const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';
const PG_INVALID_TEXT_REPRESENTATION = '22P02';

@Injectable()
export class ObjectsService {
  constructor(
    @InjectRepository(ObjectEntity)
    private readonly objectsRepository: Repository<ObjectEntity>,
    private readonly quantityService: QuantityService,
  ) {}

  async create(dto: CreateObjectDto): Promise<ObjectResponse> {
    this.quantityService.validateProperties(dto.unit, dto.properties);

    const object = this.objectsRepository.create({
      drawingUuid: dto.drawingUuid,
      name: dto.name,
      type: dto.type,
      unit: dto.unit,
      unitPriceCents: dto.unitPriceCents,
      properties: dto.properties,
      articleId: dto.articleId,
    });

    try {
      const saved = await this.objectsRepository.save(object);
      return this.toResponse(saved);
    } catch (error) {
      throw this.mapWriteError(error);
    }
  }

  async findAll(articleId?: string): Promise<ObjectResponse[]> {
    try {
      const objects = await this.objectsRepository.find({
        where: articleId ? { articleId } : {},
        order: { name: 'DESC' },
      });
      return objects.map((object) => this.toResponse(object));
    } catch (error) {
      if (this.pgErrorCode(error) === PG_INVALID_TEXT_REPRESENTATION) {
        throw new BadRequestException('articleId must be a valid UUID');
      }
      throw error;
    }
  }

  async findOne(id: string): Promise<ObjectResponse> {
    const object = await this.objectsRepository.findOne({ where: { id } });
    if (!object) {
      throw new NotFoundException(`Object ${id} not found`);
    }
    return this.toResponse(object);
  }

  async update(id: string, dto: UpdateObjectDto): Promise<ObjectResponse> {
    const object = await this.objectsRepository.findOne({ where: { id } });
    if (!object) {
      throw new NotFoundException(`Object ${id} not found`);
    }

    if (dto.drawingUuid !== undefined) object.drawingUuid = dto.drawingUuid;
    if (dto.name !== undefined) object.name = dto.name;
    if (dto.type !== undefined) object.type = dto.type;
    if (dto.unit !== undefined) object.unit = dto.unit;
    if (dto.unitPriceCents !== undefined)
      object.unitPriceCents = dto.unitPriceCents;
    if (dto.properties !== undefined) object.properties = dto.properties;
    if (dto.articleId !== undefined) object.articleId = dto.articleId;

    this.quantityService.validateProperties(object.unit, object.properties);

    try {
      const saved = await this.objectsRepository.save(object);
      return this.toResponse(saved);
    } catch (error) {
      throw this.mapWriteError(error);
    }
  }

  async remove(id: string): Promise<void> {
    const object = await this.objectsRepository.findOne({ where: { id } });
    if (!object) {
      throw new NotFoundException(`Object ${id} not found`);
    }
    await this.objectsRepository.delete(id);
  }

  private toResponse(object: ObjectEntity): ObjectResponse {
    const quantity = this.quantityService.calculate(
      object.unit,
      object.properties,
    );
    return {
      ...object,
      quantity,
      lineTotalCents: Math.round(quantity * object.unitPriceCents),
    };
  }

  private mapWriteError(error: unknown): Error {
    const code = this.pgErrorCode(error);
    if (code === PG_UNIQUE_VIOLATION) {
      return new ConflictException(
        'An object with this drawingUuid already exists',
      );
    }
    if (code === PG_FOREIGN_KEY_VIOLATION) {
      return new BadRequestException(
        'articleId does not reference an existing article',
      );
    }
    return error as Error;
  }

  private pgErrorCode(error: unknown): string | undefined {
    return (
      (error as { driverError?: { code?: string }; code?: string })?.driverError
        ?.code ?? (error as { code?: string })?.code
    );
  }
}
