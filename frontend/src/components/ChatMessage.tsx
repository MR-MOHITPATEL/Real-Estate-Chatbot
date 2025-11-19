import { Download, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { downloadCsv } from "../lib/utils";
import type { ConversationMessage } from "../types/chat";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ChartDisplay } from "./ChartDisplay";
import { DataTable } from "./DataTable";

interface ChatMessageProps {
  message: ConversationMessage;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div className="flex w-full flex-col gap-3" aria-live="polite">
      <div
        className={`flex items-start gap-4 ${
          isUser ? "flex-row-reverse text-right" : ""
        }`}
      >
        <div
          className={`h-12 w-12 rounded-2xl ${
            isUser
              ? "bg-primary/20 text-primary border border-primary/30"
              : "bg-white/10 border border-white/20 text-white"
          } flex items-center justify-center text-lg font-semibold`}
        >
          {isUser ? "You" : <Sparkles className="h-6 w-6" />}
        </div>
        <Card
          className={`max-w-4xl w-full ${
            isUser ? "bg-primary/10 text-primary-foreground" : "bg-card/80"
          }`}
        >
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-3 text-base leading-relaxed text-foreground">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>

            {message.response && (
              <div className="space-y-6">
                <div className="space-y-3 text-foreground">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.response.summary}
                  </ReactMarkdown>
                </div>

                <ChartDisplay
                  data={message.response.chart_data}
                  type={message.response.chart_type}
                />

                <DataTable rows={message.response.table_data} />

                <Button
                  variant="outline"
                  className="w-full border-primary/30 text-primary hover:bg-primary/10"
                  onClick={() =>
                    downloadCsv(
                      (message.response?.table_data || []) as Record<
                        string,
                        unknown
                      >[],
                      "filtered-real-estate-data.csv"
                    )
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Filtered Data as CSV
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


