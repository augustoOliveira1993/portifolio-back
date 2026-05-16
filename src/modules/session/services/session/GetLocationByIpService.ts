import axios from 'axios';
import { logger } from '@shared/utils/logger';
import { injectable } from 'tsyringe';
import { ILocationDTO } from '@modules/session/dto/ISessionDTO';

interface IpApiResponse {
  status: string;
  country?: string;
  regionName?: string;
  city?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  query?: string;
}

@injectable()
export default class GetLocationByIpService {
  private readonly API_URL = 'http://ip-api.com/json';

  async execute(ip: string): Promise<ILocationDTO | null> {
    // Ignora IPs locais/privados
    if (this.isPrivateIp(ip)) {
      logger.debug(`IP privado/local detectado: ${ip}, pulando geolocalização`);
      return null;
    }

    try {
      // Busca diretamente na API (sem cache)
      const location = await this.fetchLocationFromApi(ip);
      return location;
    } catch (error) {
      logger.error(`Erro ao obter geolocalização para IP ${ip}: ${error}`);
      // Retorna null em caso de erro - não deve bloquear o login
      return null;
    }
  }

  private async fetchLocationFromApi(ip: string): Promise<ILocationDTO | null> {
    try {
      const response = await axios.get<IpApiResponse>(`${this.API_URL}/${ip}`, {
        timeout: 3000, // 3 segundos de timeout
        params: {
          fields: 'status,country,regionName,city,lat,lon,timezone',
        },
      });

      if (response.data.status !== 'success') {
        logger.warn(`API de geolocalização retornou erro para IP ${ip}`);
        return null;
      }

      const location: ILocationDTO = {
        country: response.data.country,
        region: response.data.regionName,
        city: response.data.city,
        lat: response.data.lat,
        lon: response.data.lon,
        timezone: response.data.timezone,
      };

      logger.info(
        `Geolocalização obtida para IP ${ip}: ${location.city}, ${location.country}`,
      );

      return location;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.warn(
          `Falha ao consultar API de geolocalização para IP ${ip}: ${error.message}`,
        );
      } else {
        logger.error(`Erro inesperado ao buscar geolocalização: ${error}`);
      }
      return null;
    }
  }

  /**
   * Verifica se o IP é privado/local
   */
  private isPrivateIp(ip: string): boolean {
    // Remove IPv6 wrapper se presente
    const cleanIp = ip.replace(/^::ffff:/, '');

    // Localhost
    if (
      cleanIp === '127.0.0.1' ||
      cleanIp === 'localhost' ||
      cleanIp === '::1'
    ) {
      return true;
    }

    // Redes privadas IPv4
    const privateRanges = [
      /^10\./, // 10.0.0.0/8
      /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12
      /^192\.168\./, // 192.168.0.0/16
      /^169\.254\./, // 169.254.0.0/16 (link-local)
    ];

    return privateRanges.some(range => range.test(cleanIp));
  }
}
