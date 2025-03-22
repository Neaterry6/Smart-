declare module 'multer' {
  import { Request } from 'express';
  import { Options } from 'multer';

  interface StorageEngine {
    _handleFile(req: Request, file: Express.Multer.File, callback: (error?: any, info?: Partial<Express.Multer.File>) => void): void;
    _removeFile(req: Request, file: Express.Multer.File, callback: (error: Error) => void): void;
  }

  interface DiskStorageOptions {
    destination?: string | ((req: Request, file: Express.Multer.File, callback: (error: Error | null, destination: string) => void) => void);
    filename?: (req: Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) => void;
  }

  function diskStorage(options: DiskStorageOptions): StorageEngine;

  type FileFilterCallback = (error: Error | null, acceptFile: boolean) => void;

  interface MulterOptions {
    dest?: string;
    storage?: StorageEngine;
    limits?: {
      fieldNameSize?: number;
      fieldSize?: number;
      fields?: number;
      fileSize?: number;
      files?: number;
      parts?: number;
      headerPairs?: number;
    };
    preservePath?: boolean;
    fileFilter?(req: Request, file: Express.Multer.File, callback: FileFilterCallback): void;
  }

  function multer(options?: MulterOptions): any;

  namespace multer {
    var diskStorage: typeof diskStorage;
  }

  export = multer;
}