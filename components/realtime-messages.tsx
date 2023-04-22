import { useOutletContext } from '@remix-run/react';
import { useEffect, useState } from 'react';
import type { Database } from 'types/db_types';
import type { SupabaseOutletContext } from '~/root';

type Message = Database['public']['Tables']['messages']['Row'];
type Props = { serverMessages: Message[] };

export default function RealtimeMessages({ serverMessages }: Props) {
  const [messages, setMessages] = useState(serverMessages);
  const { supabase } = useOutletContext<SupabaseOutletContext>();

  useEffect(() => {
    setMessages(serverMessages);
  }, [serverMessages]);

  useEffect(() => {
    const channel = supabase
      .channel('*')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        // this thing does not work!
        console.log(payload);
        const newMessage = payload.new as Message;

        if (!messages.find(message => message.id === newMessage.id)) {
          setMessages([...messages, newMessage]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [messages, supabase]);

  return (
    <code>
      <pre>{JSON.stringify(messages, null, 2)}</pre>
    </code>
  );
}
