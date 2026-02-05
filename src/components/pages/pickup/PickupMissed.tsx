'use client';

import { useState } from 'react';
import { useTRPC } from '~/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Truck,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Home,
  Loader2,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';

export default function PickupMissed() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Fetch user address
  const addressQuery = useQuery(trpc.address.get_user_address.queryOptions());

  // Mutations and queries
  const updateAddressMutation = useMutation(
    trpc.address.update_user_address.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.address.get_user_address.queryOptions());
        toast.success('Address updated successfully!');
        setIsAddressDialogOpen(false);
        setAddressInput('');
        setSubmissionStatus('idle');
      },
      onError: (error) => {
        toast.error(error.message ?? 'Failed to update address. Please try again.');
        setSubmissionStatus('error');
      }
    })
  );
  const pickupMissedMut = useMutation(
    trpc.address.pickup_missed_waste.mutationOptions({
      onSuccess: () => {
        setComplaintSubmitted(true);
      },
      onError: (error) => {
        toast.error(error.message ?? 'Failed to submit pickup complaint. Please try again.');
      }
    })
  );

  // State for dialog
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [addressDialogMode, setAddressDialogMode] = useState<'add' | 'update'>('add');
  const [addressInput, setAddressInput] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressInput.trim()) return;

    updateAddressMutation.mutate({ address: addressInput.trim() });
  };

  const handlePickupComplaint = async () => {
    if (!addressQuery.data?.address) {
      handleAddAddress();
      return;
    }

    setSubmissionStatus('idle');
    pickupMissedMut.mutateAsync();
  };

  const handleAddAddress = () => {
    setAddressInput('');
    setAddressDialogMode('add');
    setIsAddressDialogOpen(true);
  };

  const handleEditAddress = () => {
    if (addressQuery.data?.address) {
      setAddressInput(addressQuery.data.address);
      setAddressDialogMode('update');
    }
    setIsAddressDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Report Missed Waste Pickup</h2>
        <p className="mt-2 text-muted-foreground">
          If your waste wasn't collected today, let us help you contact the authorities.
        </p>
      </div>

      {/* Address Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Your Address
          </CardTitle>
          <CardDescription>
            We need your address to locate your area and notify the appropriate authorities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {addressQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : addressQuery.data?.address ? (
            <div className="flex items-start justify-between gap-3 rounded-lg border bg-muted/50 p-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Registered Address</p>
                  <p className="text-sm text-muted-foreground">{addressQuery.data.address}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditAddress}
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No address found. Please add your address to enable pickup complaint feature.
                <Button variant="outline" size="sm" className="ml-2" onClick={handleAddAddress}>
                  Add Address
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Address Dialog */}
      <Dialog
        open={isAddressDialogOpen}
        onOpenChange={(open) => {
          setIsAddressDialogOpen(open);
          if (!open) {
            setAddressInput('');
            setAddressDialogMode('add');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {addressDialogMode === 'update' ? 'Update Address' : 'Add Your Address'}
            </DialogTitle>
            <DialogDescription>
              {addressDialogMode === 'update'
                ? 'Update your address information for accurate waste pickup services.'
                : 'Please provide your complete address so we can locate your area for waste pickup services.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddressSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your full address (street, city, state, pincode)"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  disabled={updateAddressMutation.isPending}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddressDialogOpen(false)}
                disabled={updateAddressMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!addressInput.trim() || updateAddressMutation.isPending}
              >
                {updateAddressMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : addressDialogMode === 'update' ? (
                  'Update Address'
                ) : (
                  'Save Address'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Pickup Complaint Card */}
      {complaintSubmitted ? (
        <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Complaint Submitted Successfully
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              Your request has been received and is being processed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg bg-green-100/50 p-6 text-center dark:bg-green-900/20">
                <div className="mb-4">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-green-800 dark:text-green-200">
                  We apologize for the inconvenience
                </h3>
                <p className="mb-4 text-green-700 dark:text-green-300">
                  Your waste pickup request will be fulfilled as early as possible. Our team has
                  been notified and will ensure prompt collection.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                  <span>Processing your request...</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-green-700 dark:text-green-300">
                  You will receive updates on the status of your request. Thank you for your
                  patience.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Report Missed Pickup
            </CardTitle>
            <CardDescription>
              Submit a complaint if your waste wasn't collected today. We'll notify the authorities
              immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900/20">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium">Waste not collected today?</p>
                    <p className="text-sm text-muted-foreground">
                      Click below to report this issue and get it resolved quickly.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Messages */}
              {submissionStatus === 'success' && (
                <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    Your pickup complaint has been submitted successfully! The authorities have been
                    notified and will address this issue promptly.
                  </AlertDescription>
                </Alert>
              )}

              {submissionStatus === 'error' && (
                <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    Failed to submit the pickup complaint. Please try again or contact support if
                    the issue persists.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handlePickupComplaint}
                disabled={!addressQuery.data?.address || pickupMissedMut.isPending}
                className="w-full"
                size="lg"
              >
                {pickupMissedMut.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting Complaint...
                  </>
                ) : (
                  <>
                    <Truck className="mr-2 h-5 w-5" />
                    Report Missed Pickup
                  </>
                )}
              </Button>

              {!addressQuery.data?.address && (
                <p className="text-center text-sm text-muted-foreground">
                  Please add your address above to enable the complaint feature.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>What happens next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-100 p-1 dark:bg-blue-900/20">
                <span className="text-xs font-bold text-blue-600">1</span>
              </div>
              <div>
                <p className="font-medium">Complaint Registered</p>
                <p className="text-sm text-muted-foreground">
                  Your complaint is logged in our system with timestamp and location details.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-100 p-1 dark:bg-blue-900/20">
                <span className="text-xs font-bold text-blue-600">2</span>
              </div>
              <div>
                <p className="font-medium">Authorities Notified</p>
                <p className="text-sm text-muted-foreground">
                  Local waste management authorities are immediately notified of the missed pickup.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-100 p-1 dark:bg-blue-900/20">
                <span className="text-xs font-bold text-blue-600">3</span>
              </div>
              <div>
                <p className="font-medium">Resolution</p>
                <p className="text-sm text-muted-foreground">
                  You'll receive updates on the status, and pickup will be scheduled within 24
                  hours.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
