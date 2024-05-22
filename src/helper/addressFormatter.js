export function formatAddress(address) {
  const filteredAddress = {...address};

  const addressParts = [
    filteredAddress.subThoroughfare,
    filteredAddress.thoroughfare,
    filteredAddress.subLocality,
    filteredAddress.locality,
    filteredAddress.administrativeArea,
    filteredAddress.postalCode,
    filteredAddress.country,
  ].filter(Boolean);

  const formattedAddress = addressParts.join(', ');

  return formattedAddress;
}
