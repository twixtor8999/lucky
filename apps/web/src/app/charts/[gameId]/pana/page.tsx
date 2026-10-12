import { redirect } from 'next/navigation';

export default function PanaChartPage({ params }: { params: { gameId: string } }) {
  redirect(`/chart/pana/${params.gameId}`);
}
