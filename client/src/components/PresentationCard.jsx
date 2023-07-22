import React from "react";
import {
  Box,
  Heading,
  Flex,
  Text,
  IconButton,
  Button,
  Spacer,
} from "@chakra-ui/react";

const PresentationCard = ({
  direction,
  title,
  description,
  buttonText,
  ...rest
}) => {
  return (
    <Box p={5} shadow="md" borderWidth="1px" {...rest}>
      <Flex direction={direction} style={{ justifyContent: "center" }}>
        <Heading as="h2" fontSize="xl">
          {title}
        </Heading>
        <Spacer />
        <Box flexGrow="4" h={"33vh"}>
          <Text p={4} mt={4} flexGrow="4">
            {description}
          </Text>
        </Box>
        <Spacer />
        <Button>{buttonText}</Button>
        <IconButton />
      </Flex>
    </Box>
  );
};

export default PresentationCard;
