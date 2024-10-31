import React, { useState } from 'react';
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { useQuery } from "@tanstack/react-query";
import { getComments, Comment } from "../apiRequest";
import {useRouter} from "next/router";

function Video() {

  const router = useRouter();
  const { home } = router.query;

  const { data: comments, isLoading, error } = useQuery<Comment[], Error>({
    queryKey: ['comments', home],
    queryFn: () => getComments(home as string),
    enabled: !!home,
  });

  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  if (isLoading) {
    return <Typography variant="h6" align="center">Cargando...</Typography>;
  }

  if (error) {
    return <Typography variant="h6" align="center" color="error">Error al cargar los comentarios</Typography>;
  }

  // Filtrar los comentarios con parent_id null (comentarios principales)
  const topLevelComments = comments?.filter(comment => !comment.parent_id && (selectedTag ? comment.tags.includes(selectedTag) : true)).sort((a, b) => b.like_count - a.like_count);

  // Función para renderizar comentarios hijos
  const renderReplies = (parentId:any) => {
    const replies = comments?.filter(comment => comment.parent_id === parentId).sort((a, b) => b.like_count - a.like_count);
    console.log('replies', replies);

    return replies?.map((reply) => (
      <Card key={reply.id} sx={{ ml: 4, mt: 2 }}>
        <CardContent>
          <Typography variant="subtitle2">
            {reply.users?.author_display_name}
          </Typography>
          <Typography variant="body2">
            {reply.text_display}
          </Typography>
          <Typography variant="caption" color="textSecondary" fontWeight={'bold'}>
            👍 Likes: {reply.like_count}
          </Typography>
        </CardContent>
      </Card>
    ));
  };

  return (
    <Grid container spacing={4} justifyContent="center">
      <Grid item xs={12}>
        <Typography variant="h5" align="left">Video Info</Typography>
      </Grid>
      <Grid item xs={12}>
        <Stack direction="row" spacing={2} mb={2} justifyContent="center">
          {['idea', 'positive', 'negative'].map((tag) => (
            <Chip
              key={tag}
              label={tag.charAt(0).toUpperCase() + tag.slice(1)}
              clickable
              color={selectedTag === tag ? 'primary' : 'default'}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              sx={{
                backgroundColor: selectedTag === tag ? (tag === 'idea' ? 'purple' : tag === 'positive' ? 'lightgreen' : 'red') : 'gray',
                color: 'white'
              }}
            />
          ))}
          <Chip
            label="Todos"
            clickable
            color={selectedTag === null ? 'primary' : 'default'}
            onClick={() => setSelectedTag(null)}
            sx={{ backgroundColor: selectedTag === null ? 'blue' : 'gray', color: 'white' }}
          />
        </Stack>
        <Grid container spacing={2}>
          {topLevelComments?.map((comment) => (
            <Grid item xs={12} sm={12} md={6} key={comment.id}>
              <Card style={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1">
                    {comment.users?.author_display_name}
                  </Typography>
                  <Typography variant="body1">
                    {comment.text_display}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" fontWeight={'bold'}>
                    👍 Likes: {comment.like_count}
                  </Typography>
                  <Stack direction="row" spacing={1} mt={1}>
                    {comment.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        sx={{
                          backgroundColor: tag === 'idea' ? 'purple' : tag === 'positive' ? 'lightgreen' : tag === 'negative' ? 'red' : 'gray',
                          color: 'white'
                        }}
                      />
                    ))}
                  </Stack>
                  {renderReplies(comment.id)}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Video;
