import { redirect } from "next/navigation";

interface Props {
    params: Promise<{ contestId: string }>;
}

export default async function ProblemIndexPage({ params }: Props) {
    const { contestId } = await params;
    redirect(`/contest/${contestId}/problem/A`);
}
