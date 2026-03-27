"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import PetsIcon from "@mui/icons-material/Pets";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import CalendarIcon from "@mui/icons-material/CalendarToday";
import { apiJson, AuthError } from "../../lib/api";

type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  birthdate: string | null;
  vaccinations: {
    status: "current" | "due-soon" | "overdue";
    count: number;
  };
  upcomingAppointments: number;
};

export default function ClientDashboardPage() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      const data = await apiJson<Pet[]>("/v1/client/pets");
      setPets(data);
    } catch (e: unknown) {
      if (e instanceof AuthError) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography>Loading your pets...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Pets
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View your pets information, vaccination status, and upcoming appointments.
      </Typography>

      {pets.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <PetsIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No pets found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Contact the clinic to have your pets added to your account.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {pets.map((pet) => (
            <Grid item xs={12} sm={6} md={4} key={pet.id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <PetsIcon color="primary" />
                    <Typography variant="h6" component="div">
                      {pet.name}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {pet.species}
                    {pet.breed && ` • ${pet.breed}`}
                  </Typography>

                  {pet.birthdate && (
                    <Typography variant="body2" color="text.secondary">
                      Born: {new Date(pet.birthdate).toLocaleDateString()}
                    </Typography>
                  )}

                  <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip
                      size="small"
                      icon={<VaccinesIcon />}
                      label={
                        pet.vaccinations.status === "current"
                          ? "Vaccines Current"
                          : pet.vaccinations.status === "due-soon"
                          ? "Vaccines Due Soon"
                          : "Vaccines Overdue"
                      }
                      color={
                        pet.vaccinations.status === "current"
                          ? "success"
                          : pet.vaccinations.status === "due-soon"
                          ? "warning"
                          : "error"
                      }
                    />
                    
                    {pet.upcomingAppointments > 0 && (
                      <Chip
                        size="small"
                        icon={<CalendarIcon />}
                        label={`${pet.upcomingAppointments} Upcoming`}
                        color="info"
                      />
                    )}
                  </Box>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    fullWidth
                    variant="outlined"
                    onClick={() => router.push(`/client/pets/${pet.id}`)}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
