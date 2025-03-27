import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { MegaphoneIcon } from "lucide-react";
import { customButton } from "@/lib/buttonVariants";
import { MouseEventHandler } from "react";

export default function AnnouncementButton({ onClick }: { onClick?: MouseEventHandler<HTMLButtonElement> }) {
  const router = useRouter();

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    router.push("/announcement");
    if (onClick) onClick(e); // 若有額外事件（如關閉選單）則執行
  };

  return (
    <Button
      variant="ghost"
      className={customButton({ intent: "ghost", size: "sm" })}
      onClick={handleClick}
    >
      <MegaphoneIcon className="h-4 w-4" />
      <span>公告</span>
    </Button>
  );
}
