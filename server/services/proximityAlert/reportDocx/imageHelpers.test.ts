import { Paragraph, ImageRun } from 'docx'
import { imageParagraph } from './imageHelpers'

jest.mock('docx', () => ({
  ...jest.requireActual('docx'),
  ImageRun: jest.fn().mockImplementation(options => options),
  Paragraph: jest.fn().mockImplementation(options => options),
}))

const mockImageRun = jest.mocked(ImageRun)
const mockParagraph = jest.mocked(Paragraph)

describe('imageHelpers', () => {
  describe('imageParagraph', () => {
    it('should create a Paragraph containing an ImageRun', () => {
      // Given a small jpeg
      const tinyJpeg = Buffer.from(
        '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAF/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAqf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/ASP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/ASP/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/Al//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IV//2gAMAwEAAgADAAAAEP/EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8QH//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8QH//EABQQAQAAAAAAAAAAAAAAAAAAABD/2gAIAQEAAT8QH//Z',
        'base64',
      )
      const imageType = 'jpg'

      // When the paragraph is created with the image
      imageParagraph(tinyJpeg)

      // Then the image size should not have changed
      expect(mockImageRun).toHaveBeenCalledWith({
        data: tinyJpeg,
        transformation: { width: 1, height: 1 },
        type: imageType,
      })

      // And the paragraph should be centered with no indent or spacing
      expect(mockParagraph).toHaveBeenCalledWith({
        alignment: 'center',
        children: [mockImageRun.mock.results[0].value],
        indent: {
          left: 0,
          right: 0,
        },
        spacing: {
          after: 0,
          before: 0,
        },
      })
    })
  })
})
