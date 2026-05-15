import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';

@Catch()
export class I18nExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || responseObj.error || message;
        if (Array.isArray(message)) {
          message = message[0];
        }
      }
    }

    // Get language from Accept-Language header or use default
    const acceptLanguage = request.headers['accept-language'] as string | undefined;
    const lang = acceptLanguage || 'en';

    // Translate the message if it's a translation key
    let translatedMessage = message;
    try {
      const translated = await this.i18n.translate(message, { lang }) as string;
      if (translated && translated !== message) {
        translatedMessage = translated;
      }
    } catch (error) {
      // If translation fails, use original message
    }

    response.status(status).json({
      statusCode: status,
      message: translatedMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
