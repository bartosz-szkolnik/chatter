import type { ActionArgs, LoaderArgs, V2_MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { createServerSupabase } from '../../utils/supabase.server';
import { Form, useLoaderData } from '@remix-run/react';
import Login from 'components/login';
import RealtimeMessages from 'components/realtime-messages';

export const meta: V2_MetaFunction = () => {
  return [{ title: 'New Remix App' }];
};

export const action = async ({ request }: ActionArgs) => {
  const response = new Response();
  const supabase = createServerSupabase({ request, response });

  const { message } = Object.fromEntries(await request.formData());
  const { error } = await supabase.from('messages').insert({ content: String(message) });

  if (error) {
    console.log(error);
  }

  return json(null, { headers: response.headers });
};

export const loader = async ({ request }: LoaderArgs) => {
  const response = new Response();
  const supabase = createServerSupabase({ request, response });

  const { data } = await supabase.from('messages').select();
  return { messages: data ?? [] };
};

export default function Index() {
  const { messages } = useLoaderData<typeof loader>();
  return (
    <>
      <Login></Login>
      <RealtimeMessages serverMessages={messages}></RealtimeMessages>
      <Form method="post">
        <input type="text" name="message" />
        <button>Send</button>
      </Form>
    </>
  );
}
