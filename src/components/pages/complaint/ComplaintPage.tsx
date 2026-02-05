'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import { CheckCircle2, MapPin, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useTRPC } from '~/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type UserDashboardTab = 'dashboard' | 'complaint' | 'game' | 'assistant';

interface ComplaintPageProps {
  onTabChange?: (tab: UserDashboardTab) => void;
}

const FALLBACK_COORDS = { lat: 25.4596052, lng: 81.8522483 };

function isValidCoords(
  coords: { lat: number; lng: number } | null | undefined
): coords is { lat: number; lng: number } {
  return (
    !!coords &&
    typeof coords.lat === 'number' &&
    typeof coords.lng === 'number' &&
    !isNaN(coords.lat) &&
    !isNaN(coords.lng) &&
    coords.lat >= -90 &&
    coords.lat <= 90 &&
    coords.lng >= -180 &&
    coords.lng <= 180
  );
}

// Singleton loader instance to prevent multiple loads
let loaderInstance: Loader | null = null;
let mapsLibraryPromise: Promise<google.maps.MapsLibrary> | null = null;
let markerLibraryPromise: Promise<google.maps.MarkerLibrary> | null = null;

function getLoader(apiKey: string): Loader {
  if (!loaderInstance) {
    loaderInstance = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['maps', 'marker']
    });
  }
  return loaderInstance;
}

async function loadMapsLibrary(apiKey: string): Promise<google.maps.MapsLibrary> {
  const loader = getLoader(apiKey);
  if (!mapsLibraryPromise) {
    mapsLibraryPromise = loader.importLibrary('maps');
  }
  return mapsLibraryPromise;
}

async function loadMarkerLibrary(apiKey: string): Promise<google.maps.MarkerLibrary> {
  const loader = getLoader(apiKey);
  if (!markerLibraryPromise) {
    markerLibraryPromise = loader.importLibrary('marker');
  }
  return markerLibraryPromise;
}

export default function ComplaintPage({ onTabChange }: ComplaintPageProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [mapLoadState, setMapLoadState] = useState<'loading' | 'loaded' | 'error' | 'no-key'>(
    'loading'
  );
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [userLocationFetched, setUserLocationFetched] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'biodegradable' | 'non-biodegradable' | 'other' | ''>(
    ''
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [done, setDone] = useState(false);
  const [refId, setRefId] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInitializedRef = useRef(false);

  // Get user's geolocation
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setUserLocationFetched(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (isValidCoords(userCoords)) {
          setCoords(userCoords);
        }
        setUserLocationFetched(true);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setUserLocationFetched(true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Initialize the map
  const initializeMap = useCallback(
    async (center: { lat: number; lng: number }) => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey || !mapRef.current) return;

      try {
        const [mapsLib, markerLib] = await Promise.all([
          loadMapsLibrary(apiKey),
          loadMarkerLibrary(apiKey)
        ]);

        const { Map } = mapsLib;
        const { AdvancedMarkerElement } = markerLib;

        const validCenter = isValidCoords(center) ? center : FALLBACK_COORDS;

        const gm = new Map(mapRef.current, {
          center: validCenter,
          zoom: 17,
          mapTypeControl: true,
          fullscreenControl: true,
          streetViewControl: false,
          mapId: 'COMPLAINT_MAP_ID'
        });

        const m = new AdvancedMarkerElement({
          position: validCenter,
          map: gm,
          gmpDraggable: true
        });

        // Set initial coords if not already set
        if (!isValidCoords(coords)) {
          setCoords(validCenter);
        }

        // Handle map clicks
        gm.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;
          const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
          if (isValidCoords(pos)) {
            m.position = pos;
            setCoords(pos);
          }
        });

        // Handle marker drag
        m.addListener('dragend', () => {
          const p = m.position;
          if (!p) return;
          // AdvancedMarkerElement.position can be LatLng, LatLngLiteral, or LatLngAltitudeLiteral
          let pos: { lat: number; lng: number };
          if ('lat' in p && typeof p.lat === 'function') {
            // It's a LatLng object with methods
            pos = { lat: (p as google.maps.LatLng).lat(), lng: (p as google.maps.LatLng).lng() };
          } else {
            // It's a LatLngLiteral or LatLngAltitudeLiteral with plain number properties
            pos = { lat: p.lat as number, lng: p.lng as number };
          }
          if (isValidCoords(pos)) {
            setCoords(pos);
          }
        });

        setMap(gm);
        setMarker(m);
        setMapLoadState('loaded');
      } catch (error) {
        console.error('Google Maps failed to load:', error);
        setMapLoadState('error');
      }
    },
    [coords]
  );

  // Load Google Maps API and initialize map
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setMapLoadState('no-key');
      return;
    }

    // Wait for user location before initializing to avoid unnecessary re-centering
    // But don't wait too long - if geolocation takes too long, use fallback
    if (!userLocationFetched) return;

    // Prevent double initialization
    if (mapInitializedRef.current) return;
    mapInitializedRef.current = true;

    const initialCenter = isValidCoords(coords) ? coords : FALLBACK_COORDS;
    initializeMap(initialCenter);
  }, [userLocationFetched, coords, initializeMap]);

  // Update map center and marker when coords change (after initial load)
  useEffect(() => {
    if (!map || !marker || mapLoadState !== 'loaded') return;
    if (!isValidCoords(coords)) return;

    map.panTo(coords);
    marker.position = coords;
  }, [coords, map, marker, mapLoadState]);

  const submit_new_complaint_mut = useMutation<{ id: string }, Error, FormData>({
    mutationFn: async (payload) => {
      const response = await fetch('/api/submit_complaint', {
        method: 'POST',
        body: payload
      });
      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(errorPayload?.message ?? 'Failed to submit complaint');
      }
      return response.json() as Promise<{ id: string }>;
    },
    onSuccess: async (data) => {
      setRefId(data.id);
      setDone(true);
      setSelectedImage(null);
      await queryClient.invalidateQueries(trpc.complaints.list_complaints.queryOptions());
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    if (!isValidCoords(coords)) {
      toast.error('Please select a valid location on the map');
      return;
    }

    if (
      !category ||
      (category !== 'biodegradable' && category !== 'non-biodegradable' && category !== 'other')
    ) {
      toast.error('Please select a valid category');
      return;
    }

    const payload = new FormData();
    payload.append('title', title.trim());
    payload.append('description', description.trim());
    payload.append('category', category);
    payload.append('longitude', coords.lng.toString());
    payload.append('latitude', coords.lat.toString());
    if (selectedImage) {
      payload.append('image', selectedImage);
    }

    submit_new_complaint_mut.mutate(payload);
  }

  if (done) {
    const mapUrl =
      coords &&
      typeof coords.lat === 'number' &&
      typeof coords.lng === 'number' &&
      !isNaN(coords.lat) &&
      !isNaN(coords.lng)
        ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}`
        : '#';
    return (
      <div className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20 }}
          className="relative w-full"
        >
          <Card className="w-full overflow-hidden">
            <motion.div
              initial={{ backgroundPosition: '0% 50%' }}
              animate={{ backgroundPosition: '100% 50%' }}
              transition={{ duration: 2.2, repeat: Infinity, repeatType: 'mirror' }}
              className="h-20 w-full bg-linear-to-r from-emerald-500/25 via-blue-500/25 to-violet-500/25 bg-size-[200%_200%]"
            />
            <CardHeader className="-mt-10">
              <div className="flex items-center gap-3">
                <span className="relative inline-flex items-center justify-center rounded-full bg-emerald-500/10 p-2 text-emerald-600 ring-1 ring-emerald-500/20">
                  <motion.span
                    initial={{ scale: 0.8 }}
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    className="absolute inset-0 rounded-full ring-2 ring-emerald-400/40"
                    style={{ filter: 'blur(1px)' }}
                  />
                  <motion.span
                    initial={{ rotate: -8 }}
                    animate={{ rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 14 }}
                  >
                    <CheckCircle2 className="size-6" />
                  </motion.span>
                </span>
                <div>
                  <CardTitle className="flex items-center gap-2 bg-linear-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    Thank you for reporting!
                    <Sparkles className="size-4 text-blue-500" />
                  </CardTitle>
                  <CardDescription>
                    Your report has been noted and forwarded to the local authority.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {refId ? (
                <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                  Reference ID:{' '}
                  <span className="font-mono font-semibold tracking-wider">{refId}</span>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-4" />
                  {coords &&
                  typeof coords.lat === 'number' &&
                  typeof coords.lng === 'number' &&
                  !isNaN(coords.lat) &&
                  !isNaN(coords.lng)
                    ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
                    : 'N/A'}
                </span>
                {mapUrl !== '#' ? (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-md border px-2 py-1 text-xs hover:bg-accent"
                  >
                    View on Google Maps
                  </a>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  onClick={() => onTabChange?.('dashboard')}
                  className="transition-transform hover:scale-[1.02]"
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    submit_new_complaint_mut.reset();
                    setDone(false);
                    setRefId(null);
                    setTitle('');
                    setDescription('');
                    setCategory('');
                    setSelectedImage(null);
                    formRef.current?.reset();
                  }}
                  className="transition-transform hover:scale-[1.02]"
                >
                  Report another issue
                </Button>
              </div>
            </CardContent>
          </Card>
          <ConfettiBurst key={refId} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-5xl gap-4 p-4 lg:grid-cols-[1.2fr_1fr]">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Select Location</CardTitle>
          <CardDescription>
            Click on the map or drag the marker to pinpoint the issue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative h-[420px] w-full overflow-hidden rounded-lg border">
            <div ref={mapRef} className="h-full w-full" />
            {mapLoadState === 'loading' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/80">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loading map...</span>
              </div>
            )}
            {mapLoadState === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/80">
                <AlertCircle className="size-8 text-destructive" />
                <span className="text-sm text-destructive">Failed to load Google Maps</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    mapInitializedRef.current = false;
                    setMapLoadState('loading');
                    const initialCenter = isValidCoords(coords) ? coords : FALLBACK_COORDS;
                    initializeMap(initialCenter);
                  }}
                >
                  Retry
                </Button>
              </div>
            )}
            {mapLoadState === 'no-key' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/80">
                <AlertCircle className="size-8 text-amber-500" />
                <span className="text-sm text-amber-600">Google Maps API key not configured</span>
              </div>
            )}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            {isValidCoords(coords)
              ? `Selected: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
              : mapLoadState === 'loaded'
                ? 'Click on the map to select a location'
                : 'Loading...'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Raise a Complaint</CardTitle>
          <CardDescription>
            Submissions are forwarded to the local authority for verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Garbage dumping near park"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as typeof category)}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="biodegradable">Biodegradable</SelectItem>
                  <SelectItem value="non-biodegradable">Non-biodegradable</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                placeholder="Describe the issue briefly..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image (optional)</Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  setSelectedImage(event.target.files?.[0] ?? null);
                }}
              />
              {selectedImage ? (
                <p className="text-xs text-muted-foreground">Selected file: {selectedImage.name}</p>
              ) : null}
            </div>
            <div className="space-y-1">
              <Label>Selected Coordinates</Label>
              <div className="rounded-md border bg-muted/50 px-3 py-2 text-xs">
                {coords &&
                typeof coords.lat === 'number' &&
                typeof coords.lng === 'number' &&
                !isNaN(coords.lat) &&
                !isNaN(coords.lng)
                  ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
                  : 'Select on map'}
              </div>
            </div>
            <div className="pt-2">
              <Button
                type="submit"
                disabled={
                  !coords ||
                  !(
                    typeof coords.lat === 'number' &&
                    typeof coords.lng === 'number' &&
                    !isNaN(coords.lat) &&
                    !isNaN(coords.lng)
                  ) ||
                  submit_new_complaint_mut.isPending
                }
                className="w-full"
              >
                {submit_new_complaint_mut.isPending ? 'Submitting...' : 'Submit Complaint'}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              By submitting you agree this is a public-spirited report and contains no personal
              data.
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function ConfettiBurst() {
  // lightweight confetti using CSS animated dots
  const dots = Array.from({ length: 24 });
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="relative mx-auto h-full w-full max-w-3xl">
        {dots.map((_, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 0, x: 0, scale: 0.8 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: [0, -80 - (i % 5) * 15, -120 - (i % 5) * 20],
              x: [
                0,
                (i % 2 === 0 ? 1 : -1) * (30 + (i % 6) * 12),
                (i % 2 === 0 ? 1 : -1) * (50 + (i % 6) * 15)
              ],
              scale: [0.8, 1.2, 1, 0.8]
            }}
            transition={{
              duration: 2.5 + (i % 5) * 0.15,
              delay: i * 0.05,
              ease: 'easeOut'
            }}
            className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              backgroundColor:
                i % 4 === 0
                  ? '#10b981'
                  : i % 4 === 1
                    ? '#3b82f6'
                    : i % 4 === 2
                      ? '#a78bfa'
                      : '#f59e0b'
            }}
          />
        ))}
      </div>
    </div>
  );
}
