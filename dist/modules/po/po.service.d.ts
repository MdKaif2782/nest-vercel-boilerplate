import { CreatePoDto } from './dto/create-po.dto';
import { UpdatePoDto } from './dto/update-po.dto';
export declare class PoService {
    create(createPoDto: CreatePoDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updatePoDto: UpdatePoDto): string;
    remove(id: number): string;
}
