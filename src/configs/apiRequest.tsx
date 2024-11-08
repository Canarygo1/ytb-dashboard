import {createClient} from "@supabase/supabase-js";

export interface Channel {
  id: string; // uuid
  name: string; // text
  created_at: string; // timestamp with time zone
}

export interface Comment {
  id: string; // character varying
  text_display: string; // text
  like_count: number; // integer
  parent_id?: string; // character varying, optional
  created_at: string; // timestamp without time zone
  tags: string[]; // text[]
  reasoning: string; // text
  channel_improving: string; // text
  user_id: string; // character varying
  video_id: string; // uuid
  users?: User; // User
}

export interface User{
  id: string; // character varying
  author_display_name: string; // text
}
export interface Conclusion{
  id: string;
  conclusions: string;
  channel_improving: string;
  video_id: string;
  created_at: string;
  future_collab: string;
  tag:string
}
export interface Video{
  id: string;
  name:string;
  url:string;
  video_id:string;
  channel?:Channel;
  channel_id:string;
  miniatura_url:string;
  created_at:string;
}
export const client = createClient('https://mvabyrkvufhxfqdujpyh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12YWJ5cmt2dWZoeGZxZHVqcHloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxNjQxNDQsImV4cCI6MjA0NDc0MDE0NH0.utAwT7DX_Ra0W6X4FABjtIUsobHx1iI_5h3cAYckqv8')

export const getVideos = async (userId:string) => {
  const response = await client
    .from('video')
    .select('*, comments(count)')
    .eq('channel_id', userId);


  return response.data as Video[]
}
export const getVideoConclusion = async (videoId:string): Promise<Conclusion[]> => {
  const response = await client
    .from('conclusion')
    .select('*')
    .eq('video_id', videoId)

  return response.data as Conclusion[]
}
export const getVideo = async (videoId:string): Promise<Video> => {
  const response = await client
    .from('video')
    .select('*, comments(count)')
    .eq('id', videoId).single();

  return response.data as Video
}
export const getComments = async (videoId:string): Promise<Comment[]> => {
  console.log('videoId',videoId)
  const response = await client
    .from('comments')
    .select('*, video(*),users(*)')
    .eq('video_id', videoId);

  return response.data as Comment[]
}

