import { HostServer, TicketsServer } from "./host";
import { AxiosServer } from "./server";

class TicketClient extends AxiosServer {
  constructor(hostServer: HostServer) {
    super(hostServer);
  }

  GetTicketById(id: string) {
    return this.get<TicketSystem.Ticket>(`/tickets/${id}`); // getTIckets
  }
  GetTickets() {
    return this.get<TicketSystem.Ticket[]>(`/tickets`); // getTIckets
  }
  GetReplays(id: string) {
    return this.get<TicketSystem.Ticket[]>(`/tickets/${id}/replies`); // getTIckets
  }

  UpdateTicketById(id: string, data: TicketSystem.updateTicket) {
    return this.put(`/tickets/${id}`, data); // getTIckets
  }

  ReplyTicket(id: string, data: TicketSystem.createTicket) {
    return this.post(`/tickets/${id}/replies`, data); // getTIckets
  }

  PostTicket(data: TicketSystem.createTicket) {
    return this.post(`/tickets/`, data); // getTIckets
  }
}

const ticketClient = new TicketClient(TicketsServer);
export default ticketClient;
