import { redirect } from 'next/navigation';

export default function JodiChartPage({ params }: { params: { gameId: string } }) {
  redirect(`/chart/jodi/${params.gameId}`);
}