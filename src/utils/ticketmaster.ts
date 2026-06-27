import { EventPrefill } from '../types/navigation';

const API_KEY = process.env.EXPO_PUBLIC_TICKETMASTER_API_KEY;
const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';

export interface TicketmasterEventResult {
  id: string;
  prefill: EventPrefill;
}

function mapEvent(event: any): TicketmasterEventResult {
  const venue = event._embedded?.venues?.[0]?.name || '';
  const attractions = event._embedded?.attractions || [];
  const artists = attractions.length > 0
    ? attractions.map((a: any) => a.name)
    : [event.name];
  const image = event.images?.find((img: any) => img.width >= 300)?.url || event.images?.[0]?.url;

  return {
    id: event.id,
    prefill: {
      title: event.name,
      artists,
      venue,
      date: event.dates?.start?.localDate || new Date().toISOString().split('T')[0],
      imageUri: image,
    },
  };
}

export async function searchTicketmasterEvents(query: string): Promise<TicketmasterEventResult[]> {
  if (!API_KEY) {
    throw new Error('Ticketmaster API key is not configured. Set EXPO_PUBLIC_TICKETMASTER_API_KEY.');
  }

  const url = `${BASE_URL}?apikey=${API_KEY}&keyword=${encodeURIComponent(query)}&size=20`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Ticketmaster request failed with status ${response.status}`);
  }

  const data = await response.json();
  const events = data._embedded?.events || [];
  return events.map(mapEvent);
}
