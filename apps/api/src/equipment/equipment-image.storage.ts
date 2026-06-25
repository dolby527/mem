import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const EQUIPMENT_IMAGE_URL_PREFIX = "/api/equipment-image";

@Injectable()
export class EquipmentImageStorage {
  private readonly uploadDir: string;

  constructor(config: ConfigService) {
    const configured = config.get<string>("EQUIPMENT_IMAGE_UPLOAD_DIR");
    this.uploadDir = configured
      ? join(process.cwd(), configured)
      : join(process.cwd(), "../../uploads/equipment");
  }

  getUploadDir(): string {
    return this.uploadDir;
  }

  assertValidFile(file: Express.Multer.File) {
    if (!file?.buffer?.length) {
      throw new BadRequestException("이미지 파일이 필요합니다.");
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException("이미지는 5MB 이하여야 합니다.");
    }
    if (!ALLOWED_MIME[file.mimetype]) {
      throw new BadRequestException(
        "지원 형식: JPEG, PNG, WebP만 업로드할 수 있습니다.",
      );
    }
  }

  async save(
    hospitalId: string,
    equipmentSlug: string,
    file: Express.Multer.File,
  ): Promise<string> {
    this.assertValidFile(file);
    const ext = ALLOWED_MIME[file.mimetype]!;
    const dir = join(this.uploadDir, hospitalId);
    await mkdir(dir, { recursive: true });
    const filename = `${equipmentSlug}.${ext}`;
    const absolutePath = join(dir, filename);
    try {
      await writeFile(absolutePath, file.buffer);
    } catch {
      throw new InternalServerErrorException("이미지 저장에 실패했습니다.");
    }
    return `${EQUIPMENT_IMAGE_URL_PREFIX}/${encodeURIComponent(hospitalId)}/${encodeURIComponent(filename)}`;
  }

  async deleteByUrl(imageUrl: string | null | undefined): Promise<void> {
    if (!imageUrl?.startsWith(`${EQUIPMENT_IMAGE_URL_PREFIX}/`)) return;
    const relative = imageUrl.slice(EQUIPMENT_IMAGE_URL_PREFIX.length + 1);
    const segments = relative.split("/").map((s) => decodeURIComponent(s));
    if (segments.length !== 2 || segments.some((s) => !s || s.includes(".."))) {
      return;
    }
    const absolutePath = join(this.uploadDir, ...segments);
    try {
      await unlink(absolutePath);
    } catch {
      // missing file is fine
    }
  }
}
