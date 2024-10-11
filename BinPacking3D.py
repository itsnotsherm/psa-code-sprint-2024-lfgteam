import torch

class BinPacking3D:
    def __init__(self, container_dim):
        self.container_dim = torch.tensor(container_dim)  # Container dimensions as a PyTorch tensor
        self.items = []
        self.filled_volume = 0

    def can_fit(self, item_dim):
        """Check if item can fit in the remaining space."""
        available_space = self.container_dim - torch.tensor(item_dim)
        return torch.all(available_space >= 0)

    def add_item(self, item_dim):
        """Add an item if it fits in the container."""
        if self.can_fit(item_dim):
            self.items.append(item_dim)
            self.filled_volume += torch.prod(torch.tensor(item_dim))
            return True
        else:
            print("Item does not fit.")
            return False

    def packing_efficiency(self):
        """Calculate the efficiency based on the filled volume."""
        container_volume = torch.prod(self.container_dim)
        return (self.filled_volume / container_volume).item()

# Usage
container_dim = [10, 10, 10]  # Example container dimensions
bin_packer = BinPacking3D(container_dim)

items = [
    [2, 2, 2],
    [5, 5, 5],
    [3, 3, 3]
]

for item in items:
    bin_packer.add_item(item)

print(f"Packing efficiency: {bin_packer.packing_efficiency():.2f}")
