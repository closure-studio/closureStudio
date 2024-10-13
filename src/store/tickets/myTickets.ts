import { shallowReactive } from "vue";
import { Type } from "../../components/toast/enum";
import { GetReplays, GetTicketById, GetTickets } from "../../plugins/axios";
import { setMsg } from "../../plugins/common";

interface State {
    ticketList: TicketSystem.Ticket[];
    replyList: Record<string, TicketSystem.Ticket[]>;
    isLoadingTickets: boolean;
}

export const myTickets = shallowReactive<State>({
    ticketList: [],
    replyList: {},
    isLoadingTickets: false,
});

export const getTicketById = (id: string) => {
    if (!id) return;
    const ticket = myTickets.ticketList.find((item) => item.id === id);
    return ticket;
}

export const queryTicketList = async () => {
    myTickets.isLoadingTickets = true;
    try {
        const res = await GetTickets();
        if (res.data && res.code == 1) {
            // check res.data is array
            if (Array.isArray(res.data)) {
                myTickets.ticketList = res.data;
            }
        }
    } catch (error) {
        setMsg(error, Type.Error);
    } finally {
        myTickets.isLoadingTickets = false;
    }
};

export const updateTicketStateById = async (id: string) => {
    if (!id) return;

    try {
        const [respGetTicket, respGetReplays] = await Promise.all([
            GetTicketById(id),
            GetReplays(id)
        ]);

        if (respGetTicket.code === 0 || respGetReplays.code === 0) {
            setMsg(respGetTicket.message || respGetReplays.message, Type.Error);
            return;
        }

        const ticket = respGetTicket.data;
        if (ticket) {
            const index = myTickets.ticketList.findIndex((item) => item.id === id);
            if (index !== -1) {
                myTickets.ticketList[index] = ticket;
            }
        }

        myTickets.replyList = { ...myTickets.replyList, [id]: respGetReplays.data };
    } catch (error) {
        setMsg(error, Type.Error);
    }
};