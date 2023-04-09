import { BaseSyntheticEvent, useState } from "react";

import {
  useDisclosure,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Box,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  VStack,
  Text,
  NumberInputStepper,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  ListItem,
  UnorderedList,
  useToast,
} from "@chakra-ui/react";

const ReviewModal = ({
  gameId,
  gameName,
  searchResults,
  handleReviewAdd,
}: {
  gameId: Number;
  gameName: string;
  searchResults: Array<Object>;
  handleReviewAdd: Function;
}) => {
  const [rating, setRating] = useState("10");
  const [content, setContent] = useState("");

  const [isLoading, setisLoading] = useState(false);
  const [contentError, setContentError] = useState(false);

  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleContentChange = (event: BaseSyntheticEvent) => {
    if (event.target.value === "") {
      setContentError(true);
    } else {
      setContent(event.target.value);
      setContentError(false);
    }
  };

  const handleSubmit = (): void => {
    setisLoading(true);
    if (!contentError) {
      fetch("/api/review", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + localStorage.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          game_id: gameId,
          rating: rating,
          content: content,
        }),
      }).then((response) => {
        if (response.status === 200) {
          handleReviewAdd();
          setisLoading(false);
          onClose();
        } else {
          toast({
            title: "Review add failed",
            status: "error",
            position: "top",
            duration: 5000,
          });
          setisLoading(false);
        }
      });
    }
  };
  return (
    <Box>
      <Button size="sm" colorScheme="green" mt="10px" onClick={onOpen}>
        Add review
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{gameName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {searchResults[gameId]["reviews"].length >= 1 && (
              <Text fontSize={"lg"}>Reviews</Text>
            )}
            <UnorderedList>
              {searchResults[gameId]["reviews"].length &&
                searchResults[gameId]["reviews"].map((item: string) => {
                  return (
                    <ListItem>
                      {item["rating"]} - {item["content"]}
                    </ListItem>
                  );
                })}
            </UnorderedList>
            <VStack align="unset" spacing="5" p="5">
              <FormControl isRequired>
                <FormLabel>Rating</FormLabel>
                <NumberInput
                  defaultValue={10}
                  min={0}
                  max={10}
                  onChange={setRating}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>Rating is required.</FormErrorMessage>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Content</FormLabel>
                <Input placeholder="Content" onChange={handleContentChange} />
                <FormErrorMessage>Content is required.</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              isLoading={isLoading}
              onClick={handleSubmit}
            >
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ReviewModal;
