import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import { useQuery } from '@tanstack/react-query';
import { getVideos, Video } from '../apiRequest';
import {Button} from "@mui/material";

const Home = () => {
  // get userId from local storage
  const userId = localStorage.getItem('channelId');
  const { data: videos, isLoading, error } = useQuery<Video[]>({
    queryKey: ['videos', userId],
    queryFn: () => getVideos(userId as string),
    enabled: userId !== null,
  });

  if (isLoading) {
    return <Typography variant="h6" align="center">Cargando...</Typography>;
  }

  if (error) {
    return <Typography variant="h6" align="center" color="error">Error al cargar los videos</Typography>;
  }

  return (
    <Grid container spacing={4} justifyContent="center">
      <Grid item xs={12}>
        <Typography variant="h5" align="left">Mis videos</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4} justifyContent="left">
          {videos?.map((video) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={video.id}>
              <Card >
                <CardMedia
                  component="img"
                  image={video.miniatura_url}
                  title={video.name}
                  sx={{ height: 200, borderRadius: '12px' }}
                />
                <CardContent sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'center',

                }}>
                  <Typography variant="subtitle1" align="center">
                    {video.name}
                  </Typography>
                  <Button style={{
                    marginTop: '10px',
                  }} variant={'contained'} href={`/home/${video.id}`}>Ver análisis</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Home;
