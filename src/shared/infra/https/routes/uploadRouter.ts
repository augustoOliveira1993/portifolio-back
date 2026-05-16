import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import sharp from 'sharp';
import uploadConfig from '@configs/storage/upload.config';
import { verifyToken } from '@shared/middlewares/authMiddleware';

const router = Router();

const upload = multer({
  storage: uploadConfig.storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|jpg|png|webp|gif)$/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens (jpeg, png, webp, gif) são permitidas'));
    }
  },
});

router.post(
  '/',
  [verifyToken],
  upload.array('files', 10),
  async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    if (!files?.length) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }

    // Converte buffer em memória para WebP e grava no disco
    const filenames = await Promise.all(
      files.map(async (f) => {
        const filename = `${crypto.randomBytes(10).toString('hex')}.webp`;
        const dest = path.join(uploadConfig.directory, filename);
        await sharp(f.buffer).webp({ quality: 85 }).toFile(dest);
        return filename;
      }),
    );

    return res.json({ filenames });
  },
);

router.delete(
  '/:filename',
  [verifyToken],
  (req: Request, res: Response) => {
    // Valida o filename para evitar path traversal
    const { filename } = req.params;
    if (!filename || filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
      return res.status(400).json({ message: 'Filename inválido' });
    }

    const filePath = path.join(uploadConfig.directory, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Arquivo não encontrado' });
    }

    fs.unlinkSync(filePath);
    return res.status(204).send();
  },
);

export default router;
