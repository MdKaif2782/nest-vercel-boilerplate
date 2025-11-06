import { PoService } from './po.service';
import { CreatePoDto } from './dto/create-po.dto';
import { UpdatePoDto } from './dto/update-po.dto';
export declare class PoController {
    private readonly poService;
    constructor(poService: PoService);
    create(createPoDto: CreatePoDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updatePoDto: UpdatePoDto): string;
    remove(id: string): string;
}
