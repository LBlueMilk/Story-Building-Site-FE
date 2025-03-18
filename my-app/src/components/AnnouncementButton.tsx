import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AnnouncementButton() {
  const router = useRouter();

  return (
    <Button
      variant="secondary"
      className="flex items-center space-x-2"
      onClick={() => router.push("/announcement")}
    >
      公告 + EMAIL
    </Button>
  );
}
