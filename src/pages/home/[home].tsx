import React, { useEffect, useState } from 'react';
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { useQuery } from "@tanstack/react-query";
import { getComments, Comment, getVideo, Video, Conclusion, getVideoConclusion } from "../../configs/apiRequest";
import { useRouter } from "next/router";
import CardMedia from "@mui/material/CardMedia";

function Video() {

  const router = useRouter();
  const { home } = router.query;
  const [tagsCounter, setTagsCounter] = useState<any>(null);

  const { data: comments, isLoading, error } = useQuery<Comment[], Error>({
    queryKey: ['comments', home],
    queryFn: () => getComments(home as string),
    enabled: !!home,
  });

  const { data: conclusions, isLoading: isLoadingConclusions, isError: errorConclusions } = useQuery<Conclusion[], Error>({
    queryKey: ['conclusions', home],
    queryFn: () => getVideoConclusion(home as string),
    enabled: !!home,
  });

  const { data: video, isLoading: isLoadingVideo, isError: errorVideo } = useQuery<Video, Error>({
    queryKey: ['video', home],
    queryFn: () => getVideo(home as string),
    enabled: !!home,
  });

  useEffect(() => {
    if (!comments) return;
    const tags = comments?.reduce((acc: any, comment: any) => {
      if (!comment.tags) return acc;
      comment.tags.forEach((tag: any) => {
        acc[tag] = acc[tag] ? acc[tag] + 1 : 1;
      });

      return acc;
    });
    setTagsCounter(tags);
  }, [comments]);

  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  if (isLoading || tagsCounter === null || isLoadingVideo || isLoadingConclusions) {
    return <Typography variant="h6" align="center">Cargando...</Typography>;
  }

  if (error || errorVideo || errorConclusions) {
    return <Typography variant="h6" align="center" color="error">Error al cargar los comentarios</Typography>;
  }

  const topLevelComments = comments?.filter(comment => !comment.parent_id && (selectedTag ? comment.tags.includes(selectedTag) : true)).sort((a, b) => b.like_count - a.like_count);

  const renderReplies = (parentId: any) => {
    const replies = comments?.filter(comment => comment.parent_id === parentId).sort((a, b) => b.like_count - a.like_count);

    return replies?.map((reply) => (
      <Card key={reply.id} sx={{ ml: { xs: 2, md: 4 }, mt: 2 }}>
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
    <Grid container spacing={2} justifyContent="left">
      <Grid item xs={12}>
        <Typography variant="h5" align="left">Video Info</Typography>
      </Grid>
      <Grid item container xs={12} spacing={2}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardMedia
              component="img"
              image={video!.miniatura_url}
              title={video!.name}
              sx={{ height: { xs: 150, md: 200 }, borderRadius: '12px' }}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              justifyContent: 'space-between',
            }}>
              <Typography variant="h6" align="left">{video!.name}</Typography>
              <Typography align="left">Total de comentarios: {comments!.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h5" align="left">Conclusiones</Typography>
        <Grid container spacing={2}>
          {conclusions?.map((conclusion) => (
            <Grid item xs={12} md={4} key={conclusion.id}>
              <Card sx={{ height: '100%', maxHeight: 400 }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Chip label={conclusion.tag} sx={{
                    backgroundColor: conclusion.tag === 'idea' ? 'purple' : conclusion.tag === 'positive' ? 'lightgreen' : 'red',
                    color: 'white'
                  }} />
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>
                    {conclusion.conclusions}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Card sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" align="left">Filtros</Typography>
          <Stack direction="row" spacing={1} mb={2} justifyContent="left">
            {['idea', 'positive', 'negative'].map((tag) => (
              <Chip
                key={tag}
                label={`${tag.charAt(0).toUpperCase() + tag.slice(1)} ${tagsCounter[tag] || 0}`}
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
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h5" align="left">Comentarios</Typography>
        <Grid container spacing={2}>
          {topLevelComments?.map((comment) => (
            <Grid item xs={12} key={comment.id}>
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
                          backgroundColor: tag === 'idea' ? 'purple' : tag === 'positive' ? 'lightgreen' : 'red',
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
