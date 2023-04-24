// @ts-nocheck

import { BaseSyntheticEvent, useState } from "react";
import {
  InputGroup,
  Input,
  Button,
  VStack,
  Text,
  Heading,
  Flex,
  useToast,
  FormControl,
  HStack,
  FormErrorMessage,
  InputLeftElement,
  Select,
  Box,
  ListItem,
  UnorderedList,
  Tag,
  Wrap,
  WrapItem,
  useColorModeValue,
  SimpleGrid,
  Link,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

import { Link as RouterLink } from "react-router-dom";

const Links = ["Register", "Login", "Profile", "Search"];

const NavLink = ({ children }: { children: ReactNode }) => (
  <Link
    as={RouterLink}
    to={"/" + children.toLowerCase()}
    px={2}
    py={1}
    rounded={"md"}
    _hover={{
      textDecoration: "none",
      bg: useColorModeValue("gray.200", "gray.700"),
    }}
  >
    {children}
  </Link>
);

import ReviewModal from "../../components/ReviewModal";

const Search = (): React.ReactElement => {
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState("game");
  const [searchResults, setSearchResults] = useState([]);
  // const [reviews, setReviews] = useState([]);

  const [isLoading, setisLoading] = useState(false);
  const [searchError, setSearchError] = useState(false);

  const toast = useToast();

  const handleSearchChange = (event: BaseSyntheticEvent) => {
    if (searchType === "lucky_rating" || searchType === "lucky_price") {
      setSearchType("game");
      setSearchResults([]);
    }

    if (event.target.value === "") {
      setSearchError(true);
    } else {
      setSearch(event.target.value);
      setSearchError(false);
    }
  };

  const handleSearchTypeChange = (event: BaseSyntheticEvent) => {
    setSearchResults([]);
    setSearchType(event.target.value);
  };

  const handleSubmit = (): void => {
    setisLoading(true);
    if (searchType === "lucky_rating" || searchType === "lucky_price") {
      setSearchType("game");
      setSearchResults([]);
      setisLoading(false);
      return;
    }
    if (!searchError) {
      fetch("/api/search", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + localStorage.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ search_type: searchType, search: search }),
      })
        .then((response) => {
          if (response.status === 200) {
            toast({
              title: "Search successful",
              status: "success",
              position: "top",
              duration: 5000,
            });

            return response.json();
          } else {
            toast({
              title: "Search failed",
              status: "error",
              position: "top",
              duration: 5000,
            });
          }
        })
        .then((json) => {
          setSearchResults(json);
          setisLoading(false);
        });
    }
  };
  const handleLucky = (): void => {
    const luckyType = Math.random() < 0.5 ? "lucky_rating" : "lucky_price";
    setSearchType(luckyType);

    fetch("/api/search", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ search_type: luckyType }),
    })
      .then((response) => {
        if (response.status === 200) {
          toast({
            title: "Search successful",
            status: "success",
            position: "top",
            duration: 5000,
          });

          return response.json();
        } else {
          toast({
            title: "Lucky failed",
            status: "error",
            position: "top",
            duration: 5000,
          });
        }
      })
      .then((json) => {
        setSearchResults(json);
      });
  };

  return (
    <Box>
      <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <HStack spacing={8} alignItems={"center"}>
            <HStack
              as={"nav"}
              spacing={4}
              display={{ base: "none", md: "flex" }}
            >
              {Links.map((link) => (
                <NavLink key={link}>{link}</NavLink>
              ))}
            </HStack>
          </HStack>
        </Flex>
      </Box>
      <Flex minH={"90vh"} align={"center"} justify={"center"}>
        <VStack
          align="unset"
          spacing="5"
          p="5"
          border="1px"
          borderColor="gray.100"
          minWidth={"50vw"}
        >
          <Heading size="lg">Search</Heading>

          <FormControl isRequired isInvalid={searchError}>
            <HStack>
              <Select width="19rem" onChange={handleSearchTypeChange}>
                <option value="game">Game</option>
                <option value="developer">Developer</option>
                <option value="max_price">Budget</option>
              </Select>
              <InputGroup>
                <InputLeftElement
                  pointerEvents="none"
                  children={<SearchIcon color="gray.300" />}
                />
                <Input type="search" onChange={handleSearchChange} />
              </InputGroup>
            </HStack>
            <FormErrorMessage>Search value is required.</FormErrorMessage>
          </FormControl>

          <SimpleGrid gap={2} columns={2}>
            <Button
              isLoading={isLoading}
              loadingText="Searching"
              onClick={handleSubmit}
            >
              Search
            </Button>
            <Button onClick={handleLucky}>Feeling lucky?</Button>
          </SimpleGrid>

          {searchType === "developer" &&
            !isLoading &&
            Object.keys(searchResults).map((key: string) => {
              return (
                <Box>
                  <Heading size="md">{key}</Heading>
                  <UnorderedList>
                    {searchResults[key].map((item: string) => {
                      return <ListItem>{item}</ListItem>;
                    })}
                  </UnorderedList>
                </Box>
              );
            })}

          {searchType === "max_price" &&
            !isLoading &&
            Object.keys(searchResults).map((key) => {
              return (
                <Box>
                  <Wrap>
                    <WrapItem>
                      <Heading size="md">{searchResults[key]["name"]}</Heading>
                    </WrapItem>
                    {searchResults[key]["attributes"].map((attribute) => (
                      <WrapItem>
                        <Tag
                          p={2}
                          size={"sm"}
                          key={attribute}
                          variant="solid"
                          colorScheme="teal"
                        >
                          {attribute}
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                  <Text fontSize="lg">
                    Developer: {searchResults[key]["developer"]}
                  </Text>
                  <Text fontSize="lg">
                    Release Date: {searchResults[key]["release_date"]}
                  </Text>
                  <Text fontSize="lg">
                    Price: ${searchResults[key]["price"]}
                  </Text>
                  <Text fontSize="lg">
                    Languages: {searchResults[key]["languages"]}
                  </Text>
                  <Text fontSize="lg">
                    Average Rating: {searchResults[key]["reviews"][0]["rating"]}
                  </Text>
                  <ReviewModal
                    gameId={key}
                    gameName={searchResults[key]["name"]}
                    searchResults={searchResults}
                    handleReviewAdd={handleSubmit}
                  ></ReviewModal>
                </Box>
              );
            })}

          {searchType === "game" &&
            !isLoading &&
            Object.keys(searchResults).map((key) => {
              return (
                <Box>
                  <Wrap>
                    <WrapItem>
                      <Heading size="md">{searchResults[key]["name"]}</Heading>
                    </WrapItem>
                    {searchResults[key]["attributes"].map((attribute) => (
                      <WrapItem>
                        <Tag
                          p={2}
                          size={"sm"}
                          key={attribute}
                          variant="solid"
                          colorScheme="teal"
                        >
                          {attribute}
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                  <Text fontSize="lg">
                    Developer: {searchResults[key]["developer"]}
                  </Text>
                  <Text fontSize="lg">
                    Release Date: {searchResults[key]["release_date"]}
                  </Text>
                  <Text fontSize="lg">
                    Price: ${searchResults[key]["price"]}
                  </Text>
                  <Text fontSize="lg">
                    Languages: {searchResults[key]["languages"]}
                  </Text>
                  {searchResults[key]["reviews"].length >= 1 && (
                    <Text fontSize="lg">Reviews</Text>
                  )}
                  <UnorderedList>
                    {searchResults[key]["reviews"].length &&
                      searchResults[key]["reviews"].map((item: string) => {
                        return (
                          <ListItem>
                            {item["rating"]} - {item["content"]}
                          </ListItem>
                        );
                      })}
                  </UnorderedList>
                  <ReviewModal
                    gameId={key}
                    gameName={searchResults[key]["name"]}
                    searchResults={searchResults}
                    handleReviewAdd={handleSubmit}
                  ></ReviewModal>
                </Box>
              );
            })}
            {searchType === "lucky_price" && searchResults && (
            <Box>
              <Text size={"lg"} mb="2">
                This query uses subqueries set operations. This query find the
                game name, platform (Windows, Linux, or Mac), and price, for all
                games with a price within the specified range (in this case,
                grade 3) for any of the three platforms.
              </Text>
              {Object.keys(searchResults).map((key) => {
                return (
                  <Box>
                    <Heading size="md">{key}</Heading>

                    <Text fontSize="lg">
                      Linux: {searchResults[key]["platform_linux"]}
                    </Text>
                    <Text fontSize="lg">
                      Mac: {searchResults[key]["platform_mac"]}
                    </Text>
                    <Text fontSize="lg">
                      Windows: {searchResults[key]["platform_windows"]}
                    </Text>
                    <Text fontSize="lg">
                      Price: {searchResults[key]["price"]}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          )}

          {searchType === "lucky_rating" && searchResults && (
            <Box>
              <Text size={"lg"} mb="2">
                This query used Join of multiple relations and Aggregation via
                GROUP BY. This query gets the list of top-rated games along with
                their average rating, release date, and the names of the
                developers who developed them, for all games that have a rating
                greater than 4.0.
              </Text>
              {Object.keys(searchResults).map((key) => {
                return (
                  <Box>
                    <Heading size="md">{key}</Heading>

                    <Text fontSize="lg">
                      Average Rating: {searchResults[key]["average_rating"]}
                    </Text>
                    <Text fontSize="lg">
                      Release Date: {searchResults[key]["release_date"]}
                    </Text>
                    <Text fontSize="lg">
                      Developer: {searchResults[key]["developer"]}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          )}
        </VStack>
      </Flex>
    </Box>
  );
};

export default Search;
