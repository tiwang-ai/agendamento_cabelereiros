// src/components/AppointmentsTable.tsx
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  useTheme
} from '@mui/material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';


interface Appointment {
  id: string;
  cliente: {
    nome: string;
  };
  servico: {
    nome_servico: string;
  };
  data_agendamento: string;
  horario: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface AppointmentsTableProps {
  appointments: Appointment[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const AppointmentsTable = ({ appointments, onEdit, onDelete }: AppointmentsTableProps) => {
  const theme = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Cliente</TableCell>
            <TableCell>Serviço</TableCell>
            <TableCell>Data</TableCell>
            <TableCell>Horário</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell>{appointment.cliente.nome}</TableCell>
              <TableCell>{appointment.servico.nome_servico}</TableCell>
              <TableCell>
                {format(new Date(appointment.data_agendamento), "dd 'de' MMMM", { locale: ptBR })}
              </TableCell>
              <TableCell>{appointment.horario}</TableCell>
              <TableCell>
                <Chip
                  label={getStatusText(appointment.status)}
                  color={getStatusColor(appointment.status)}
                  size="small"
                />
              </TableCell>
              <TableCell align="right">
                <IconButton onClick={() => onEdit(appointment.id)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => onDelete(appointment.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AppointmentsTable;