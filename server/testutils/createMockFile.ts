import { Readable } from 'stream'

const createMockFile = (overrideProperties?: Partial<Express.Multer.File>): Express.Multer.File => ({
  filename: '',
  originalname: '',
  encoding: '',
  mimetype: '',
  size: 0,
  stream: new Readable(),
  destination: '',
  fieldname: '',
  path: '',
  buffer: Buffer.from(''),
  ...overrideProperties,
})

export default createMockFile
